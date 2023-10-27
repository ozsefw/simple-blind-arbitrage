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
        let cur_ts = Date.now();
        console.log("Event: (cur %s, last %s, state)", cur_ts, last_ts);

        if (MatchMaker.readyState == EventSource.CLOSED){
            console.log("Event: EventSource closed");
            break;
        }
        else if ((cur_ts - last_ts) > (30*1000) ){
            console.log("Event: timeout");
            MatchMaker.close()
            break;
        }
        await sleep(3000);
    }
}

async function main(){
    while(true){
        try{
            await sub_mm();
        }
        catch(e){
            console.log("Event: Execption, ", e)
            await sleep(3000);
        }
    }
}

main()
