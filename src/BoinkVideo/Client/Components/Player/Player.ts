class Player extends Component {
	private set isPlaying(val: boolean) {
		if (val) {
			(<HTMLImageElement>this.shadowRoot.querySelector(".button")).src = "Images/PauseIcon.svg";
		} else {
			(<HTMLImageElement>this.shadowRoot.querySelector(".button")).src = "Images/PlayIcon.svg";
		}
        this._isPlaying = val;
	}
	private get isPlaying(): boolean {
		return this._isPlaying;
	}
	private _isPlaying: boolean;
	
	public createdCallback(): void {
		super.createdCallback();
		this._isPlaying = false;
	}
	public attachedCallback(): void {
		super.attachedCallback();
		this.shadowRoot.querySelector("video").addEventListener("play", () => this.isPlaying = true);
		this.shadowRoot.querySelector("video").addEventListener("pause", () => this.isPlaying = false);
		this.shadowRoot.querySelector(".button").addEventListener("click", () => {
			this.playPause();
		});
	}
	public playPause(): void {
		if (!this.isPlaying) {
			this.play();
		} else {
			this.pause();
		}
	}
	public play(): void {
		var videoElement = <HTMLVideoElement>this.shadowRoot.querySelector("video");
		videoElement.play();
	}
	public pause(): void {
		var videoElement = <HTMLVideoElement>this.shadowRoot.querySelector("video");
		videoElement.pause();
	}
}
Component.register("bv-player", Player);
