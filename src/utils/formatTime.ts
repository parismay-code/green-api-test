export default (date: Date, withSeconds: boolean) => {
    let seconds = date.getSeconds().toString();
    let minutes = (date.getMinutes() + 1).toString();
    let hours = date.getHours().toString();

    if (seconds.length === 1) {
        seconds = `0${seconds}`;
    }

    if (minutes.length === 1) {
        minutes = `0${minutes}`;
    }

    if (hours.length === 1) {
        hours = `0${hours}`;
    }

    return `${hours}:${minutes}` + (withSeconds ? `:${seconds}` : '');
};
