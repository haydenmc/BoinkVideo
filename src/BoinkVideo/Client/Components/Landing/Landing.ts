/**
 * Component that displays the landing page.
 */
class Landing extends Component {
    public tagClicked: (tag: Observable<TagModel>) => void;

    public createdCallback(): void {
        this.tagClicked = (tag) => {
            console.log("Tag '" + tag.value.name.value + "' clicked.");
            var tagBrowserDataModel = new TagBrowserDataModel();
            tagBrowserDataModel.tag.value = tag.value;
            for (var i = 0; i < 8; i++) {
                var videoModel = new VideoModel();
                videoModel.title.value = "Test Video " + (i + 1);
                videoModel.id.value = i.toString();
                videoModel.description.value = "This is a test description for a test video number " + (i + 1);
                videoModel.credit.value = "Test User " + (i + 1);
                tagBrowserDataModel.videos.value.push(videoModel);
            }
            var tagBrowser = <TagBrowser>document.createElement("bv-tagbrowser");
            tagBrowser.dataContext = new Observable(tagBrowserDataModel);
            (<BoinkVideo>this.parentComponent).navigateTo(tagBrowser);
        };
    }

    public attachedCallback(): void {
        super.attachedCallback();
    }
}
Component.register("bv-landing", Landing);
