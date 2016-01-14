class UserBadge extends Component {
    public attachedCallback(): void {
        super.attachedCallback();
        this.addEventListener("click", (ev) => {
            this.showUserPane();
        });
    }
    
    public showUserPane(): void {
        if (document.body.querySelector("bv-user-pane") === null) {
            var userPane = document.createElement("bv-user-pane");
            document.body.insertBefore(userPane, document.body.firstElementChild);
        }
    }
}
Component.register("bv-user-badge", UserBadge);
