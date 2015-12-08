/**
 * Component that displays the landing page.
 */
class Landing extends Component {
    public tagClicked(tag: Observable<TagModel>) {
        alert("Tag '" + tag.value.name.value + "' clicked.");
    }
}
Component.register("bv-landing", Landing);
