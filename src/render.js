import templateHTML from "./src/templates/main.html!text"

export async function render() {
    // this function just has to return a string of HTML
    // you can generate this using js, e.g. using Mustache.js

    return `
    
    <div class='ref-container'>
        <canvas class='ref-canvas'></canvas>

        <div class='ref-label ref-label--outside'>died travelling overland</div>

        <div class='ref-label ref-label--sea'>died at sea</div>

        <div class='ref-label ref-label--inside'>died within the EU</div>

        <div class='ref-copy ref-copy--hidden'>
            <p>Not all of the 34,361 deaths occur at sea, but also in detention blocks, asylum units, factories and town centres.</p>
        </div>

        <div class='ref-copy ref-copy--hidden ref-copy--right'>
            <p>Volunteers have logged more than 27,000 deaths by drowning since 1993​, often hundreds at a time when large ships capsize.</p>
        </div>

        <div class='ref-copy ref-copy--hidden'>
            <p>Some entries have a name and a story, but the majority are anonymous data points.</p>
        </div>

        <div class='ref-copy ref-copy--hidden ref-copy--right'>
            <p>For those who get to Europe, the danger is not over. The List records more than 500​​ deaths in the asylum process, detention centres, prisons and camps.</p>
        </div>

    </div>`

}

