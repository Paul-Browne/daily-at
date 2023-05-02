# daily-at

### run a function once a day at 3:15am UTC

```js
import { dailyAt } from "daily-at";

dailyAt("03:15", () => {
    console.log("Hello World!");
}, {    
    // all options are optional
    killOnError: true,              // default: false
    runOnInit: true,                // default: false
    onError: e => console.log(e)    // no default
})
```

### options

- `killOnError` (default: false) will stop executing the function if there is an error.
- `runOnInit` (default: false) will execute the function once when the script is initiated, as well as periodically.
- `onError` optional callback function when the script causes an error. The error is passed to the callback function.

### run a function 15 minutes past every hour

```js
import { hourlyAt } from "daily-at";

hourlyAt(15, () => {
    console.log("Hello World!");
})
```

### run a function every Monday at 7:15am UTC

```js
import { weeklyAt } from "daily-at";

weeklyAt("monday", "07:15" () => {
    console.log("Hello World!");
})
```
###### NOTE: you can use, for example, 1 instead of "monday". (Sunday = 0, Saturday = 6)

### run a function on the 4th of every Month at 9:00am UTC

```js
import { monthlyAt } from "daily-at";

monthlyAt(4, "9:00" () => {
    console.log("Hello World!");
})
```

###### NOTE: if you choose any date greater than 28, it will skip months that do not have that many days.

### hourly, daily, weekly

The difference between `daily` and `dailyAt` is that `dailyAt` will execute the function at a specific time. Whereas `daily` will execute the script once every 24 hours from when the script is ran. Same for `hourly` and `hourlyAt` as well as `weekly` and `weeklyAt`

```js
import { hourly, daily, weekly } from "daily-at";

hourly(() => {
    console.log("Hello World!");
})

daily(() => {
    console.log("Hello World!");
})

weekly(() => {
    console.log("Hello World!");
})
```

### every

run a function with a custom time period, eg. once `every` 6 hours

```js
import { every } from "daily-at";

// 6 hours (in milliseconds)
every(1000 * 60 * 60 * 6, () => {
    console.log("Hello World!");
})
```