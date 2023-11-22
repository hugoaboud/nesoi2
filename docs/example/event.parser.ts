import { EventParserBuilder } from "../../src/builders/event"

const fireball = new EventParserBuilder('fireball')
    .schema($ => ({
        size: $('Tamanho').float,
        power: $('Poder').int,
        glacial: $('Glacial').boolean.optional()
    }))
    .alias('Bola de fogo!')
    .build()

async function main() {

    const event = await fireball.parse({
        power: 12.2,
        size: 46
    })
    
    console.log(event)
}

main()