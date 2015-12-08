/**
 * DataModel that backs the views in BoinkVideo.
 */
class DataModel {
    public featuredVideo: Observable<VideoModel> = new Observable<VideoModel>();
    public featuredTags: Observable<ObservableArray<TagModel>>
        = new Observable<ObservableArray<TagModel>>(new ObservableArray<TagModel>());
}