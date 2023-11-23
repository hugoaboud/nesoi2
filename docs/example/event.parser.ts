import { EventBuilder } from "../../src/builders/event"

const fireball = new EventBuilder('fireball')
    .schema($ => ({
        size: $('Tamanho').float,
        power: $('Poder').int,
        glacial: $('Glacial').boolean.optional(),
        powerup: {
            speed: $('Velocidade').int
        }
    }))
    .alias('Bola de fogo!')
    .build()

async function main() {

    const event = await fireball.parse({
        power: 12.2,
        size: 46,
        powerup: {
            speed: 10
        }
    })
    
    console.log(event)
}

main()