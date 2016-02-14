class VideoThumb extends Component {
	public createdCallback(): void {
		super.createdCallback();
		this.addEventListener("click", () => {
			var player = <Player>document.createElement("bv-player");
			player.dataContext = this.dataContext;
			(<BoinkVideo>Application.instance).navigateTo(player);
		});
	}
}
Component.register("bv-videothumb", VideoThumb);
