class Player extends Component {
    private get videoElement(): HTMLVideoElement {
        return this.shadowRoot.querySelector("video");
    }
    
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
		this.videoElement.addEventListener("play", () => this.isPlaying = true);
		this.videoElement.addEventListener("pause", () => this.isPlaying = false);
        this.videoElement.addEventListener("durationchange", () => this.dataContext.value.duration.value = this.videoElement.duration);
        this.videoElement.addEventListener("timeupdate", () => this.dataContext.value.currentTime.value = this.videoElement.currentTime);
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
		this.videoElement.play();
	}
	public pause(): void {
		this.videoElement.pause();
	}
}
Component.register("bv-player", Player);
