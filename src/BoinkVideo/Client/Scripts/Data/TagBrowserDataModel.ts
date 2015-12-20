/**
 * DataModel for the TagBrowser component.
 */
class TagBrowserDataModel {
    public tag: Observable<TagModel> = new Observable<TagModel>();
    public videos: Observable<ObservableArray<VideoModel>>
        = new Observable(new ObservableArray<VideoModel>());
}