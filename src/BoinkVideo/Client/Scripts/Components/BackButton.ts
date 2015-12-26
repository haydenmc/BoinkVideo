class BackButton extends Component {
	private clickCallback: (arg) => void;
	public createdCallback() {
		super.createdCallback();
		this.clickCallback = (arg) => {
			(<BoinkVideo>Application.instance).navigateBack();
		};
		this.addEventListener("click", this.clickCallback);
	}
}
Component.register("bv-backbutton", BackButton);
