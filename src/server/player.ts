export class Player {
    id: string
    land: number[]

    constructor(id: string) {
        this.id = id
        this.land = []
    }

    addLand(land: number[]) {
        this.land = [...this.land, ...land]
    }
}
