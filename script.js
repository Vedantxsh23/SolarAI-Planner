let annualPSH = 5.0;
let panelPrice = 18000;
let inverterPrice = 8000;
let elecRate = 7.0;
let lastPrediction = {};

async function getAIReport(){
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    const locName = document.getElementById('locName').value;
    const area = document.getElementById('area').value;
    const panelType = document.getElementById('paneltype').value;
    const projtype = document.getElementById('projtype').value;

    if(!lat && !lon && !locName){
        alert('Please enter coordinates OR location name!');
        return;
    }

    document.getElementById('result').style.display='block';
    document.getElementById('status_box').innerHTML='⏳ Finding coordinates... scraping NASA + PVGIS + Kenbrook + electricity rate...';
    document.getElementById('ai_answer').innerHTML='⏳ Scraping all data sources... Please wait 60 seconds...';
    document.getElementById('feedback_box').style.display='none';

    try{
        const r = await fetch('/analyze',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({lat,lon,locName,area,panelType,projtype})
        });
        const d = await r.json();

        if(d.error){
            document.getElementById('ai_answer').innerHTML='Error: '+d.error;
            return;
        }

        annualPSH = d.map.annual_psh || 5.0;
        panelPrice = d.prices.panel_price || 18000;
        inverterPrice = d.prices.inverter_price || 8000;
        elecRate = d.elec_rate || 7.0;

        document.getElementById('coord_display').innerHTML =
            '📍 '+d.location_name+' | Lat: '+d.map.lat+', Lon: '+d.map.lon;

        document.getElementById('status_box').innerHTML =
            '✅ Coordinates found | ☀️ PSH: '+d.map.annual_psh+'h/day | '+
            '⚡ Rate: ₹'+d.elec_rate+'/kWh ('+d.state_name+') | '+
            '🏪 Kenbrook prices scraped | 🧠 AI learned from '+d.feedback_count+' past predictions';

        if(d.map && d.map.lat){
            document.getElementById('map_section').style.display='block';
            document.getElementById('map_frame').src=
                'https://www.openstreetmap.org/export/embed.html?bbox='+
                (parseFloat(d.map.lon)-0.05)+','+(parseFloat(d.map.lat)-0.05)+','+
                (parseFloat(d.map.lon)+0.05)+','+(parseFloat(d.map.lat)+0.05)+
                '&layer=mapnik&marker='+d.map.lat+','+d.map.lon;

            document.getElementById('source_info').innerHTML=`
                <div class="source-box">
                    📊 All Sources Scraped:<br>
                    <span class="nasa-badge">🛰️ NASA: ${d.map.nasa_psh||'N/A'}h/day</span>
                    <span class="pvgis-badge">🌍 PVGIS: ${d.map.pvgis_psh||'N/A'}h/day</span>
                    <span class="sun-badge">☀️ Final PSH: ${d.map.annual_psh}h/day</span>
                    <span class="kenbrook-badge">🏪 Panel: ₹${d.prices.panel_price}</span>
                    <span class="elec-badge">⚡ Rate: ₹${d.elec_rate}/kWh (${d.state_name})</span>
                </div>
            `;

            document.getElementById('weather_box').innerHTML=`
                <div class="w-card"><div class="wval">${d.map.annual_psh}h</div><div class="wlbl">Final PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.nasa_psh||'N/A'}h</div><div class="wlbl">NASA PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.pvgis_psh||'N/A'}h</div><div class="wlbl">PVGIS PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.effective_sun}h</div><div class="wlbl">Effective PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.summer_psh}h</div><div class="wlbl">Summer PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.monsoon_psh}h</div><div class="wlbl">Monsoon PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.winter_psh}h</div><div class="wlbl">Winter PSH</div></div>
                <div class="w-card"><div class="wval">${d.map.temp}°C</div><div class="wlbl">Live Temp</div></div>
                <div class="w-card"><div class="wval">${d.map.cloud}%</div><div class="wlbl">Cloud Cover</div></div>
                <div class="w-card"><div class="wval">${d.map.uv}</div><div class="wlbl">UV Index</div></div>
                <div class="w-card"><div class="wval">₹${d.elec_rate}</div><div class="wlbl">Electricity Rate</div></div>
                <div class="w-card"><div class="wval">${d.map.annual_temp}°C</div><div class="wlbl">Annual Temp</div></div>
            `;
        }

        showResults(d);
        document.getElementById('ai_answer').innerHTML = d.report;

        lastPrediction = {
            lat: d.map.lat,
            lon: d.map.lon,
            location: d.location_name,
            predicted_psh: d.map.annual_psh,
            predicted_rate: d.elec_rate,
            state: d.state_name
        };
        document.getElementById('feedback_box').style.display='block';
        loadFeedbackStats();

    }catch(e){
        document.getElementById('ai_answer').innerHTML='Error: '+e.message;
    }
}

function showResults(d){
    const area = parseFloat(document.getElementById('area').value)||1000;
    const panelType = document.getElementById('paneltype').value;
    const eff = {"Monocrystalline":1.0,"Polycrystalline":0.85,"Thin Film":0.70}[panelType];
    const panels = Math.floor(area*0.7/1.7);
    const capacityKW = Math.round(panels*0.4);
    const dailyKWh = Math.round(capacityKW*annualPSH*eff);
    const yearlyKWh = dailyKWh*365;
    const yearlyIncome = Math.round(yearlyKWh*elecRate);
    const panelCost = panels*panelPrice;
    const inverterCost = capacityKW*inverterPrice;
    const cableDC = Math.round(area*0.8);
    const cableAC = Math.round(area*0.3);
    const cableCost = Math.round((cableDC+cableAC)*150);
    const mountCost = panels*3000;
    const battCost = capacityKW*5000;
    const installCost = capacityKW*10000;
    const miscCost = Math.round((panelCost+inverterCost+cableCost+mountCost+battCost+installCost)*0.1);
    const total = panelCost+inverterCost+cableCost+mountCost+battCost+installCost+miscCost;
    const years = (total/yearlyIncome).toFixed(1);

    document.getElementById('metrics').innerHTML=`
        <div class="metric"><div class="val">${panels}</div><div class="lbl">Solar Panels</div></div>
        <div class="metric"><div class="val">${capacityKW} kW</div><div class="lbl">Capacity</div></div>
        <div class="metric"><div class="val">${dailyKWh} kWh</div><div class="lbl">Daily Output</div></div>
        <div class="metric"><div class="val">${years} yrs</div><div class="lbl">ROI Recovery</div></div>
    `;
    document.getElementById('equipment').innerHTML=`
        <div class="item"><span class="item-name">Solar Panels (${panelType} 400W)</span><span class="item-val">${panels} units @ ₹${panelPrice.toLocaleString()}/unit</span></div>
        <div class="item"><span class="item-name">Grid-Tie Inverter</span><span class="item-val">${capacityKW} kW @ ₹${inverterPrice.toLocaleString()}/kW</span></div>
        <div class="item"><span class="item-name">DC Cables</span><span class="item-val">${cableDC} meters</span></div>
        <div class="item"><span class="item-name">AC Cables</span><span class="item-val">${cableAC} meters</span></div>
        <div class="item"><span class="item-name">Mounting Structure</span><span class="item-val">${panels} sets</span></div>
        <div class="item"><span class="item-name">Battery Bank</span><span class="item-val">${capacityKW*2} kWh</span></div>
        <div class="item"><span class="item-name">Junction Boxes</span><span class="item-val">${Math.ceil(panels/10)} units</span></div>
        <div class="item"><span class="item-name">Earthing System</span><span class="item-val">1 complete set</span></div>
        <div class="item"><span class="item-name">Net Energy Meter</span><span class="item-val">1 unit</span></div>
        <div class="item"><span class="item-name">CCTV Monitoring</span><span class="item-val">1 set</span></div>
    `;
    document.getElementById('costs').innerHTML=`
        <div class="item"><span class="item-name">Solar Panels (Kenbrook price)</span><span class="item-val">₹${(panelCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Inverter</span><span class="item-val">₹${(inverterCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Cables</span><span class="item-val">₹${(cableCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Mounting Structure</span><span class="item-val">₹${(mountCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Battery Bank</span><span class="item-val">₹${(battCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Installation</span><span class="item-val">₹${(installCost/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Misc (10%)</span><span class="item-val">₹${(miscCost/100000).toFixed(2)}L</span></div>
        <div class="total"><span>Total Investment</span><span>₹${(total/100000).toFixed(2)} Lakhs</span></div>
    `;
    document.getElementById('roi').innerHTML=`
        <div class="item"><span class="item-name">NASA+PVGIS PSH</span><span class="item-val">${annualPSH}h/day</span></div>
        <div class="item"><span class="item-name">Auto-Scraped Rate</span><span class="item-val">₹${elecRate}/kWh</span></div>
        <div class="item"><span class="item-name">Total Investment</span><span class="item-val">₹${(total/100000).toFixed(2)}L</span></div>
        <div class="item"><span class="item-name">Yearly Output</span><span class="item-val">${yearlyKWh.toLocaleString()} kWh</span></div>
        <div class="item"><span class="item-name">Yearly Income</span><span class="item-val">₹${(yearlyIncome/100000).toFixed(2)}L/year</span></div>
        <div class="item"><span class="item-name">Payback Period</span><span class="item-val"><span class="tag">${years} Years</span></span></div>
        <div class="item"><span class="item-name">25 Year Earnings</span><span class="item-val">₹${((yearlyIncome*25)/100000).toFixed(0)}L</span></div>
        <div class="item"><span class="item-name">CO2 Saved/Year</span><span class="item-val">${Math.round(yearlyKWh*0.82/1000)} Tonnes</span></div>
    `;
}

async function sendFeedback(score){
    const correction = document.getElementById('correction').value;
    try{
        await fetch('/feedback',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({score, correction, prediction: lastPrediction})
        });
        if(score === 1){
            alert('✅ Thanks! AI noted this was correct for '+lastPrediction.location);
        } else {
            alert('❌ Thanks! AI will learn from this mistake for '+lastPrediction.location);
        }
        document.getElementById('correction').value='';
        loadFeedbackStats();
    }catch(e){
        alert('Error saving feedback: '+e.message);
    }
}

async function loadFeedbackStats(){
    try{
        const r = await fetch('/feedback_stats');
        const d = await r.json();
        document.getElementById('feedback_stats').innerHTML =
            '🧠 AI has learned from '+d.total+' predictions | '+
            '👍 Correct: '+d.correct+' | 👎 Wrong: '+d.wrong+
            ' | Accuracy: '+d.accuracy+'%';
    }catch(e){}
}