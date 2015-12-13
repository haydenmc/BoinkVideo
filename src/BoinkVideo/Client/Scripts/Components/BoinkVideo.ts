/**
 * The main application component. Holds the main DataModel and orchestrates the entire application.
 */
class BoinkVideo extends Application {
    public createdCallback(): void {
        super.createdCallback();
        var dataModel = new DataModel();
        var featuredVideo = new VideoModel();
        featuredVideo.id.value = "00000000-0000-0000-0000-000000000000";
        featuredVideo.title.value = "This is a test video";
        featuredVideo.description.value = "This is a test description.";
        dataModel.featuredVideo.value = featuredVideo;
        var tag = new TagModel();
        tag.name.value = "football";
        dataModel.featuredTags.value.push(tag);
        tag = new TagModel();
        tag.name.value = "prom";
        dataModel.featuredTags.value.push(tag);
        tag = new TagModel();
        tag.name.value = "graduation";
        dataModel.featuredTags.value.push(tag);
        tag = new TagModel();
        tag.name.value = "talentshow";
        dataModel.featuredTags.value.push(tag);
        this.dataContext = new Observable(dataModel);
    }

    public navigateTo(component: Component) {
        var lastElement = <HTMLElement>this.lastElementChild;
        this.appendChild(component);
        // HACK: Edge/IE doesn't seem to want to apply animations right away... we have to wait.
        setTimeout(() => {
            Animator.applyAnimation(lastElement, "animation-page-forward-out", true, () => {
                lastElement.style.display = "none";
            });
            Animator.applyAnimation(component, "animation-page-forward-in", true);
        }, 50);
    }
}
Component.register("bv-application", BoinkVideo);
