export class Settings {
    public darkTheme: boolean;
    public maximize: boolean;
    public currentPage: string;

    constructor() {
        this.darkTheme = true;
        this.maximize = false;
        this.currentPage = "";
    }
}
