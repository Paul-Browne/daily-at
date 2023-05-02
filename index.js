const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const parseTime = time => {
    const t = time.split(":")
    const h = parseInt(t[0]);
    const m = parseInt(t[1]);
    return [h, m];
}

const initialRun = async (options, func) => {
    const { killOnError, runOnInit, onError } = options;
    if (runOnInit) {
        try {
            await func();
        } catch (error) {
            if (onError) onError(error);
            if (killOnError) {
                return true
            }
        }
    }
}

const sleeper = async (erly, time) => {
    const timeNow = Date.now();
    const msPassed = Math.floor(timeNow / erly) * erly;
    const msInto = timeNow - msPassed;
    if (msInto < time) {
        await sleep(time - msInto);
    } else {
        await sleep(erly + time - msInto);
    }
}

/**
 * Run a function at every interval.
 * @param {number} interval time in milliseconds.
 * @param {function} func the function to run every interval.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script as well as periodically.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const every = async (
    interval,
    func,
    {
        killOnError = false,
        runOnInit = false,
        onError
    } = {}
) => {

    let errorOnInit = false;
    let id = setInterval(async () => {
        if (killOnError && errorOnInit) {
            clearInterval(id);
            return;
        }
        try {
            await func();
        } catch (error) {
            if (killOnError) clearInterval(id);
            if (onError) onError(error);
        }
    }, interval);

    if (runOnInit) {
        try {
            await func();
        } catch (error) {
            errorOnInit = true;
            if (onError) onError(error);
        }
    }
}

/**
 * Run a function once every hour.
 * @param {function} func the function to run every hour.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script as well as hourly.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const hourly = (func, options) => every(HOUR, func, options);

/**
 * Run a function once every day.
 * @param {function} func the function to run every day.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script as well as daily.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const daily = (func, options) => every(DAY, func, options);

/**
 * Run a function once every week.
 * @param {function} func the function to run every week.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script as well as weekly.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const weekly = (func, options) => every(WEEK, func, options);

/**
 * Run a function once every hour at a certain minute past the hour.
 * @param {string} minute the number of minutes past the hour when the function should be run.
 * @param {function} func the function to run.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script also.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const hourlyAt = async (minutes, func, options) => {

    const killed = await initialRun(options, func);
    if (killed) return

    await sleeper(HOUR, minutes * MINUTE)

    // repeat every hour
    hourly(func, { ...options, runOnInit: true })
}

/**
 * Run a function once every day at a certain time.
 * @param {string} time eg. "05:25" the time when the function should be run.
 * @param {function} func the function to run.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script also.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const dailyAt = async (time, func, options) => {
    const killed = await initialRun(options, func);
    if (killed) return

    const [h, m] = parseTime(time);

    await sleeper(DAY, (h * HOUR) + (m * MINUTE))

    // repeat every 24 hours
    daily(func, { ...options, runOnInit: true })
}

/**
 * Run a function once every week on a certain day at a certain time.
 * @param {string|number} day eg. "monday" or 1 the day when the function should be run ("sunday" = 0, "saturday" = 6).
 * @param {string} time eg. "05:25" the time when the function should be run.
 * @param {function} func the function to run.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script also.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const weeklyAt = async (day, time, func, options) => {
    const killed = await initialRun(options, func);
    if (killed) return

    const [h, m] = parseTime(time);

    if (typeof day == "string") {
        day = DAY_NAMES.indexOf(day.toLowerCase());
    }

    // 1st Jan 1970 was a Thursday
    day = (day + 3) % 7;

    await sleeper(WEEK, (day * DAY) + (h * HOUR) + (m * MINUTE))

    weekly(func, { ...options, runOnInit: true })

}

/**
 * Run a function once every month on a certain day at a certain time.
 * @param {number} date eg. 7 the 7th of the month. When the function should be run (Note: 31, will skip months which have less than 31 days).
 * @param {string} time eg. "05:25" the time when the function should be run.
 * @param {function} func the function to run.
 * @param {} options all options are optional
 * @param {boolean} [options.killOnError=false] stop the function if it errors.
 * @param {boolean} [options.runOnInit=false] run the function on initialization of the script also.
 * @param {function} [options.onError=undefined] callback function on error, passes the error to the callback function.
 */
export const monthlyAt = async (dayOfMonth, time, func, options) => {
    dailyAt(time, () => {
        const dom = new Date().getDate();
        if (dayOfMonth == dom) {
            func()
        }
    }, options)
}


// const testSleep = async message => {
//     await sleep(4000);
//     return message;
// }

// const xyz = async () => {
//     const m = await testSleep("hello");
//     // error here
//     console.log(m + " world!!");
// }

// const xyzError = async () => {
//     const m = await testSleep("hello");
//     // error here
//     console.log(m + " world!!");
// }

// dailyAt("7:53", xyz, {
//     killOnError: true,
//     runOnInit: false,
//     onError: e => console.log(e)
// })

// monthlyAt(2, "16:29", xyzError, {
//     killOnError: true,
//     runOnInit: false,
//     onError: e => console.log(e)
// })

// fourTimesAnHour(xyz, {
//     killOnError: true,
//     runOnInit: true,
//     onError: e => console.log(e)
// });


