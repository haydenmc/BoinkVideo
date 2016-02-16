/**
 * DataModel representation of a video.
 */
class VideoModel {
    public id: Observable<string> = new Observable("");
    public title: Observable<string> = new Observable("");
    public description: Observable<string> = new Observable("");
    public credit: Observable<string> = new Observable("");
    public duration: Observable<number> = new Observable(0);
    public durationTimecode: ObservableProxy<string, number> = new ObservableProxy<string, number>(this.duration, (source) => {
        var hours = Math.floor(source / (60 * 60));
        var minutes = Math.floor((source - (hours * 60 * 60)) / 60);
        var seconds = Math.floor((source - (hours * 60 * 60) - (minutes * 60)));
        return ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
    }, (durationTimecode: string, duration: number) => {
        return duration;
    });
    public currentTime: Observable<number> = new Observable(0);
    public currentTimeTimecode: ObservableProxy<string, number> = new ObservableProxy<string, number>(this.currentTime, (source) => {
        var hours = Math.floor(source / (60 * 60));
        var minutes = Math.floor((source - (hours * 60 * 60)) / 60);
        var seconds = Math.floor((source - (hours * 60 * 60) - (minutes * 60)));
        return ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
    }, (durationTimecode: string, duration: number) => {
        return duration;
    });
}