
const convertTime = (minutesSinceOrderPlaced) => {

    var hours = Math.floor((minutesSinceOrderPlaced) / 60);
    var seconds = Math.ceil((minutesSinceOrderPlaced * 360) % 60);
    var minutes;

    if (hours > 0) {
        minutes = minutesSinceOrderPlaced % 60;
        return hours + " hour(s) and " + minutes + " minutes ago and " + seconds + " ago";
    } else {
        minutes = (minutesSinceOrderPlaced - (((minutesSinceOrderPlaced * 60) % 60) / 60));
        return minutes + " minutes and " + seconds + " seconds ago";
    }

}

export default convertTime;