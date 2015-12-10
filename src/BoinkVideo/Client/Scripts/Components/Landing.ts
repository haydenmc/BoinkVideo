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
