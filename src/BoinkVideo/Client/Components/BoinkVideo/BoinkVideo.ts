/**
 * The main application component. Holds the main DataModel and orchestrates the entire application.
 */
class BoinkVideo extends Application {
    // Maintains a history of 'page' components for navigation.
    private backStack: Array<Component>;
    
    public createdCallback(): void {
        super.createdCallback();
        this.backStack = new Array<Component>();
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
        this.navigateTo(<Component>document.createElement("bv-landing"));
    }
    
    /**
     * Navigates to the specified component.
     * @param {Component} component The Component to navigate to
     */
    public navigateTo(component: Component) {
        //var lastElement = <HTMLElement>this.lastElementChild;
        var lastElement: Component = null;
        if (this.backStack.length > 0) {
            lastElement = this.backStack[this.backStack.length - 1];
        }
        this.backStack.push(component);
        this.appendChild(component);
        // HACK: Edge/IE doesn't seem to want to apply animations right away... we have to wait.
        if (lastElement !== null) {
            component.style.display = "none";
            setTimeout(() => {
                Animator.applyAnimation(lastElement, "animation-page-forward-out", true, () => {
                    lastElement.style.display = "none";
                });
                component.style.display = "";
                Animator.applyAnimation(component, "animation-page-forward-in", true);
            }, 50);
        }
        console.log(this.backStack);
    }
    
    /**
     * Navigates to the last page on the back stack.
     */
    public navigateBack(): void {
        if (this.backStack.length < 2) {
            return; // We have nothing to navigate back to.
        }
        var currentComponent = this.backStack[this.backStack.length - 1];
        var destinationComponent = this.backStack[this.backStack.length - 2];
        this.backStack.splice(this.backStack.length - 1, 1);
        setTimeout(() => {
            Animator.applyAnimation(currentComponent, "animation-page-backward-out", true, () => {
                currentComponent.parentElement.removeChild(currentComponent);
            });
            Animator.applyAnimation(destinationComponent, "animation-page-backward-in", true);
            destinationComponent.style.display = "";
        }, 50);
    }
}
Component.register("bv-application", BoinkVideo);
