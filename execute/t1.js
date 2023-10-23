const EventSource = require('eventsource');
const config = require('./utils/config.json')

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function sub_mm(){
    console.log("Event: sub_mm")
    let MatchMaker = new EventSource(config.mainnetMatchMaker)

    MatchMaker.onmessage = async (event) => {
        if (event.type == 'message'){
            var msg = JSON.parse(event.data);
            msg["ts"] = Date.now()
            console.log(JSON.stringify(msg, null, 2))
        }
        else{
            event["ts"] = Date.now()
            console.log(event)
        }
    };

    MatchMaker.onerror = (error) => {
        console.error("on errer: ", error);
        MatchMaker.close()
    }

    while(MatchMaker.readyState != EventSource.CLOSED){
        await sleep(3000);
    }
}

async function main(){
    while(true){
        await sub_mm();
    }
}

main()
