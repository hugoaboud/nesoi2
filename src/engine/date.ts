export class NesoiDate {

    jsDate: Date
    epoch: number

    constructor(
        public iso: string
    ) {
        this.jsDate = new Date(iso)
        this.epoch = this.jsDate.getTime()
    }

    static isoNow() {
        return new Date().toISOString()
    }

}