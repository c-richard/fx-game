export class Player {
    id: string
    land: number[]

    constructor(id: string) {
        this.id = id
        this.land = []
    }

    addLand(land: number) {
        this.land = [...this.land, land]
    }

    removeLand(landId: number) {
        const landIndex = this.land.findIndex((l) => l === landId)

        if (landIndex !== -1) {
            this.land.splice(landIndex, 1)
        }
    }

    hasLand() {
        this.land.length > 0
    }
}
