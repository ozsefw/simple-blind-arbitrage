const EventSource = require('eventsource');
const config = require('./utils/config.json')

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function sub_mm(){
    console.log("Event: sub_mm")
    var last_ts = Date.now();
    let MatchMaker = new EventSource(config.mainnetMatchMaker)

    MatchMaker.onmessage = async (event) => {
        let ts = Date.now();
        if (event.type == 'message'){
            var msg = JSON.parse(event.data);
            msg["ts"] = ts
            console.log(JSON.stringify(msg, null, 2))
        }
        else{
            event["ts"] = ts
            console.log(event)
        }
        last_ts = ts;
    };

    MatchMaker.onerror = (error) => {
        console.error("on errer: ", error);
        MatchMaker.close()
    }

    while (true){
        if (MatchMaker.readyState == EventSource.CLOSED){
            console.log("Event: EventSource closed");
            break;
        }
        if ((last_ts - Date.now()) > 30*1000){
            console.log("Event: no update too long");
            MatchMaker.close()
            break;
        }
        await sleep(3000);
    }
}

async function main(){
    while(true){
        await sub_mm();
    }
}

main()
