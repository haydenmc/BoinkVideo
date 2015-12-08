/**
 * DataModel representation of a video.
 */
class VideoModel {
    public id: Observable<string> = new Observable("");
    public title: Observable<string> = new Observable("");
    public description: Observable<string> = new Observable("");
}