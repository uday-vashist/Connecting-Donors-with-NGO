var ngos=[
{name:"Asha Bal Sadan",type:"Orphanage",needs:["Clothes","Books"],urgency:9,dist:{"Kothrud":2,"Baner":8,"Hadapsar":14,"Viman Nagar":12}},
{name:"Shanti Vruddhashram",type:"Old-age home",needs:["Furniture","Appliances","Clothes"],urgency:7,dist:{"Kothrud":9,"Baner":11,"Hadapsar":3,"Viman Nagar":6}},
{name:"Vidya Kendra",type:"Learning centre",needs:["Books","Utensils"],urgency:8,dist:{"Kothrud":6,"Baner":4,"Hadapsar":9,"Viman Nagar":3}}
];
var steps=["Listed","Matched with NGO","Pickup scheduled","Picked up by volunteer","Delivered to NGO","Receipt confirmed"];
var volunteers=["Rohan","Meera","Aditya","Sneha"];
var donations=[{id:"SV-1024",item:"Books",qty:12,ngo:"Vidya Kendra",stage:3}];
var items=0,meals=0,detectCount=0,lastId=null;

function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

var navButtons=document.querySelectorAll("#nav button");
for(var i=0;i<navButtons.length;i++){
navButtons[i].addEventListener("click",function(){
var tab=this.getAttribute("data-tab");
var all=document.querySelectorAll("section");
for(var j=0;j<all.length;j++){all[j].classList.remove("on")}
for(var k=0;k<navButtons.length;k++){navButtons[k].classList.remove("on")}
$(tab).classList.add("on");
this.classList.add("on");
if(tab==="impact"){renderImpact()}
if(tab==="expiry"){renderExpiry()}
});
}

$("photo").addEventListener("change",function(){
var file=this.files[0];
if(!file){return}
$("preview").innerHTML='<img alt="Selected item" src="'+URL.createObjectURL(file)+'">';
var name=file.name.toLowerCase();
var map=[["shirt","Clothes"],["cloth","Clothes"],["jacket","Clothes"],["book","Books"],["chair","Furniture"],["table","Furniture"],["fan","Appliances"],["mixer","Appliances"],["utensil","Utensils"],["pot","Utensils"]];
var cats=["Clothes","Books","Furniture","Appliances","Utensils"];
var found=null;
for(var i=0;i<map.length;i++){
if(name.indexOf(map[i][0])!==-1){found=map[i][1];break}
}
if(!found){found=cats[detectCount%cats.length];detectCount++}
$("cat").value=found;
var conf=82+Math.floor(Math.random()*15);
$("detect").innerHTML='<span class="tag">AI detected</span>'+found+', looks in good condition ('+conf+'% confident). You can edit below.';
});

function rankNgos(cat,area){
var ranked=[];
for(var i=0;i<ngos.length;i++){
var n=ngos[i];
var score=n.urgency*4;
var needs=false;
for(var j=0;j<n.needs.length;j++){if(n.needs[j]===cat){needs=true}}
if(needs){score+=40}
var d=n.dist[area];
score+=Math.max(0,20-d*2);
ranked.push({ngo:n,score:Math.min(100,Math.round(score)),dist:d,needs:needs});
}
ranked.sort(function(a,b){return b.score-a.score});
return ranked;
}

$("submit").addEventListener("click",function(){
var cat=$("cat").value,area=$("area").value,qty=parseInt($("qty").value)||1;
var ranked=rankNgos(cat,area);
var html="";
for(var i=0;i<ranked.length;i++){
var r=ranked[i];
html+='<div class="match'+(i===0?' best':'')+'"><h4>'+r.ngo.name+(i===0?' <span class="tag">Best match</span>':'')+'</h4>';
html+='<small>'+r.ngo.type+' | '+r.dist+' km from '+area+' | '+(r.needs?'Needs '+cat.toLowerCase():'Not a current need')+'</small>';
html+='<div class="bar"><i style="width:'+r.score+'%"></i></div><small>Match score '+r.score+'/100</small></div>';
}
$("results").innerHTML=html;
var id="SV-"+(1025+donations.length);
donations.push({id:id,item:cat,qty:qty,ngo:ranked[0].ngo.name,stage:1});
lastId=id;
items+=qty;
var vol=volunteers[donations.length%volunteers.length];
var eta=Math.max(10,ranked[0].dist*4+15);
$("plan").innerHTML='<div class="plan"><b>Pickup plan</b><br>Volunteer: '+vol+'<br>Stops on route today: 3 (yours is stop 2)<br>Expected arrival: in about '+eta+' minutes<br>Donation code: <b>'+id+'</b></div><button class="btn gold" id="goTrack">Track this donation</button>';
$("goTrack").addEventListener("click",function(){
$("code").value=id;
document.querySelector('[data-tab="track"]').click();
showTrack();
});
});

function makeQr(code){
var seed=0;
for(var i=0;i<code.length;i++){seed+=code.charCodeAt(i)*(i+3)}
var out="";
for(var r=0;r<9;r++){
for(var c=0;c<9;c++){
var corner=(r<3&&c<3)||(r<3&&c>5)||(r>5&&c<3);
seed=(seed*9301+49297)%233280;
var on=corner||seed%100<48;
out+='<i class="'+(on?'k':'')+'"></i>';
}
}
return out;
}

function findDonation(code){
for(var i=0;i<donations.length;i++){
if(donations[i].id.toLowerCase()===code.toLowerCase()){return donations[i]}
}
return null;
}

function showTrack(){
var code=$("code").value.trim();
var d=findDonation(code);
if(!d){
$("trackBox").style.display="none";
$("trackMsg").textContent="No donation found with that code. Try SV-1024 or make a new donation.";
return;
}
$("trackMsg").textContent="";
$("trackBox").style.display="block";
$("qr").innerHTML=makeQr(d.id);
$("tTitle").textContent=d.qty+" x "+d.item+" ("+d.id+")";
$("tSub").textContent="Going to "+d.ngo;
var html="";
for(var i=0;i<steps.length;i++){
var done=i<=d.stage;
html+='<li class="'+(done?'done':'')+'"><b>'+steps[i]+'</b><span>'+(done?'Logged and verified':'Waiting')+'</span></li>';
}
$("tl").innerHTML=html;
$("advance").style.display=d.stage>=steps.length-1?"none":"inline-block";
}

$("lookup").addEventListener("click",showTrack);
$("advance").addEventListener("click",function(){
var d=findDonation($("code").value.trim());
if(d&&d.stage<steps.length-1){d.stage++;showTrack()}
});

var forecast=[["Mon",310],["Tue",295],["Wed",330],["Thu",340],["Fri",360],["Sat",420],["Sun",390]];
var todayIndex=(new Date().getDay()+6)%7;
function renderChart(){
var html="";
for(var i=0;i<forecast.length;i++){
var h=Math.round(forecast[i][1]/450*100);
html+='<div class="col'+(i===todayIndex?' today':'')+'">'+forecast[i][1]+'<div style="height:'+h+'%"></div>'+forecast[i][0]+'</div>';
}
$("chart").innerHTML=html;
}
renderChart();

var MEAL_PRICE=40;
var UPI_ID="sevadeep@upi";
var UPI_NAME="Sevadeep";
var RUPEE="\u20B9";
var sponsoredToday=0;
var pending=null;

function updateAmount(){
var q=parseInt($("mealQty").value)||0;
$("amount").textContent=RUPEE+(q*MEAL_PRICE);
}
$("mealQty").addEventListener("input",updateAmount);
updateAmount();

$("sponsor").addEventListener("click",function(){
var q=parseInt($("mealQty").value)||0;
if(q<1){$("mealMsg").textContent="Enter at least 1 meal.";return}
var name=$("donorName").value.trim()||"Anonymous";
var amount=q*MEAL_PRICE;
var note="Narayan Seva "+q+" meals";
var link="upi://pay?pa="+UPI_ID+"&pn="+encodeURIComponent(UPI_NAME)+"&am="+amount+"&cu=INR&tn="+encodeURIComponent(note);
pending={q:q,name:name,amount:amount};
$("payInfo").textContent="Pay "+RUPEE+amount+" to "+UPI_NAME+" for "+q+" meals";
$("payQr").innerHTML="";
if(typeof QRCode!=="undefined"){
new QRCode($("payQr"),{text:link,width:170,height:170});
}else{
$("payQr").textContent="QR needs internet. Use the button below on your phone.";
}
$("upiLink").setAttribute("href",link);
$("modal").classList.add("open");
});

$("cancelPay").addEventListener("click",function(){
$("modal").classList.remove("open");
pending=null;
});

$("paid").addEventListener("click",function(){
if(!pending){return}
var txn="TXN"+Date.now().toString().slice(-8);
sponsoredToday+=pending.q;
meals+=pending.q;
$("sponsored").textContent=sponsoredToday;
$("mealMsg").innerHTML='<div class="plan"><b>Payment received (demo)</b><br>Receipt: '+txn+'<br>Name: '+esc(pending.name)+'<br>Meals: '+pending.q+'<br>Amount: '+RUPEE+pending.amount+'<br>Added to tomorrow\'s kitchen plan.</div>';
$("modal").classList.remove("open");
pending=null;
});

function renderImpact(){
$("sItems").textContent=items;
$("sMeals").textContent=meals;
$("sPeople").textContent=Math.round(items*1.5+meals/2);
var list=[["First donation",items>=1],["10 items given",items>=10],["Meal sponsor",meals>=1],["50 meals sponsored",meals>=50]];
var html="";
for(var i=0;i<list.length;i++){
html+='<span class="badge'+(list[i][1]?' on':'')+'">'+list[i][0]+'</span>';
}
$("badges").innerHTML=html;
var board=[["Anjali K.",64],["Rahul D.",51],["Priya S.",38],["You",items+meals]];
board.sort(function(a,b){return b[1]-a[1]});
var rows="";
for(var j=0;j<board.length;j++){
rows+='<tr class="'+(board[j][0]==="You"?'me':'')+'"><td>'+(j+1)+'</td><td>'+board[j][0]+'</td><td>'+board[j][1]+' acts of giving</td></tr>';
}
$("lb").innerHTML=rows;
}
renderImpact();

function dateStr(offset){
var d=new Date();
d.setDate(d.getDate()+offset);
var m=String(d.getMonth()+1).padStart(2,"0");
var day=String(d.getDate()).padStart(2,"0");
return d.getFullYear()+"-"+m+"-"+day;
}

function niceDate(s){
return new Date(s+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}

/* ---------- Volunteer skill-to-task matching ---------- */
var SKILLS=[
["Driving","Transportation"],
["Tech","Website and technical support"],
["Teaching","Educational activities"],
["Sorting","Inventory work (physical sorting)"],
["Serving","Serving meals at the kitchen"]
];
function skillTask(s){
for(var i=0;i<SKILLS.length;i++){if(SKILLS[i][0]===s){return SKILLS[i][1]}}
return s;
}

var volunteer=null;
var pool=[
{name:"Rohan",area:"Kothrud",skills:[{s:"Driving",v:true}],avail:"Anytime",access:"None",load:6},
{name:"Meera",area:"Baner",skills:[{s:"Teaching",v:true},{s:"Serving",v:true}],avail:"Weekends",access:"None",load:2},
{name:"Aditya",area:"Hadapsar",skills:[{s:"Tech",v:true}],avail:"Weekdays",access:"Seated work only",load:1},
{name:"Sneha",area:"Viman Nagar",skills:[{s:"Sorting",v:true},{s:"Driving",v:false}],avail:"Anytime",access:"None",load:9}
];
var drives=[
{id:1,ngo:"Asha Bal Sadan",title:"Winter clothes sorting",date:dateStr(0),need:6,filled:2,hours:3,skill:"Sorting",heavy:true},
{id:2,ngo:"Vidya Kendra",title:"Weekend reading session",date:dateStr(3),need:4,filled:3,hours:2,skill:"Teaching",heavy:false},
{id:3,ngo:"Shanti Vruddhashram",title:"Furniture shifting day",date:dateStr(7),need:8,filled:1,hours:4,skill:"Sorting",heavy:true},
{id:4,ngo:"Vidya Kendra",title:"Update centre website",date:dateStr(5),need:2,filled:0,hours:3,skill:"Tech",heavy:false},
{id:5,ngo:"Asha Bal Sadan",title:"Donation pickup run",date:dateStr(2),need:2,filled:1,hours:3,skill:"Driving",heavy:false}
];
var myDrives=[];
var nextDriveId=6;
var STORE="sevasetu-volunteer-v2";

function saveData(){
try{
localStorage.setItem(STORE,JSON.stringify({volunteer:volunteer,drives:drives,myDrives:myDrives,nextDriveId:nextDriveId}));
}catch(e){}
}

function loadData(){
try{
var raw=localStorage.getItem(STORE);
if(!raw){return}
var data=JSON.parse(raw);
volunteer=data.volunteer;
drives=data.drives;
myDrives=data.myDrives;
nextDriveId=data.nextDriveId;
}catch(e){}
}

function findDrive(id){
for(var i=0;i<drives.length;i++){
if(drives[i].id===id){return drives[i]}
}
return null;
}

function findMine(id){
for(var i=0;i<myDrives.length;i++){
if(myDrives[i].driveId===id){return myDrives[i]}
}
return null;
}

function myLoad(){
var h=0;
for(var i=0;i<myDrives.length;i++){
var d=findDrive(myDrives[i].driveId);
if(d){h+=d.hours}
}
return h;
}

function asCandidate(v){
return {name:v.name,skills:v.skills||[],avail:v.avail||"Anytime",access:v.access||"None",load:myLoad()};
}

function scoreVol(v,d){
var why=[];
if(d.heavy&&v.access!=="None"){
return {score:0,why:["Not suitable: task involves heavy lifting"]};
}
var skillPts=0;
for(var i=0;i<v.skills.length;i++){
if(v.skills[i].s===d.skill){
skillPts=v.skills[i].v?50:30;
why.push(v.skills[i].v?"Verified "+d.skill+" skill":d.skill+" skill (not yet verified)");
}
}
if(!skillPts){skillPts=8;why.push("No "+d.skill+" skill listed")}
var day=new Date(d.date+"T00:00:00").getDay();
var weekend=(day===0||day===6);
var availPts=0;
if(v.avail==="Anytime"||(v.avail==="Weekends"&&weekend)||(v.avail==="Weekdays"&&!weekend)){
availPts=20;why.push("Available on "+(weekend?"weekend":"weekday"));
}else{why.push("Usually unavailable on "+(weekend?"weekends":"weekdays"))}
var loadPts=Math.max(0,30-v.load*3);
why.push(v.load+" h already this month");
return {score:Math.min(100,skillPts+availPts+loadPts),why:why};
}

function renderSkillPicker(){
var html="",opts="";
for(var i=0;i<SKILLS.length;i++){
html+='<label class="chip"><input type="checkbox" value="'+SKILLS[i][0]+'"> '+SKILLS[i][0]+'</label>';
opts+='<option value="'+SKILLS[i][0]+'">'+SKILLS[i][1]+' ('+SKILLS[i][0]+')</option>';
}
$("vSkills").innerHTML=html;
$("dSkill").innerHTML=opts;
}

function renderVolunteer(){
if(volunteer){
$("vForm").style.display="none";
$("vProfile").style.display="block";
var sk="";
var allOk=true;
var list=volunteer.skills||[];
for(var i=0;i<list.length;i++){
sk+='<span class="tag'+(list[i].v?'':' ok')+'">'+list[i].s+(list[i].v?' verified':' pending')+'</span>';
if(!list[i].v){allOk=false}
}
var html='<span class="tag">Volunteer</span><b>'+esc(volunteer.name)+'</b><br>'+volunteer.area+' | '+(volunteer.avail||"Anytime")+' | Access: '+(volunteer.access||"None")+'<br>'+sk;
if(!allOk){html+='<br><button class="btn ghost" id="vVerify" style="margin-top:10px">Verify my skills (demo: NGO coordinator)</button>'}
$("vProfile").innerHTML=html;
if(!allOk){
$("vVerify").addEventListener("click",function(){
for(var j=0;j<volunteer.skills.length;j++){volunteer.skills[j].v=true}
saveData();renderVolunteer();renderDrives();renderPool();
});
}
}else{
$("vForm").style.display="block";
$("vProfile").style.display="none";
}
}

function renderDrives(){
var order=drives.slice();
var me=volunteer?asCandidate(volunteer):null;
if(me){
order.sort(function(a,b){return scoreVol(me,b).score-scoreVol(me,a).score});
}
var html="";
for(var i=0;i<order.length;i++){
var d=order[i];
var mine=findMine(d.id);
var spots=d.need-d.filled-(mine?1:0);
html+='<div class="drive"><h4>'+esc(d.title)+(d.heavy?' <span class="tag ok">Heavy lifting</span>':'')+'</h4>';
html+='<small>'+d.ngo+'</small><small>'+niceDate(d.date)+' | '+d.hours+' hours</small>';
html+='<small>Task: '+skillTask(d.skill)+' (needs '+d.skill+')</small>';
html+='<small>'+(spots>0?spots+' of '+d.need+' spots left':'All spots filled')+'</small>';
var blocked=false;
if(me){
var s=scoreVol(me,d);
blocked=s.score===0;
html+='<div class="fit"><b>Your fit: '+s.score+'%</b><div class="bar"><i style="width:'+s.score+'%"></i></div><small>'+s.why.join(' | ')+'</small></div>';
}
var cands=pool.slice();
if(me){cands.push(me)}
var ranked=[];
for(var c=0;c<cands.length;c++){
var sc=scoreVol(cands[c],d).score;
if(sc>0){ranked.push({n:cands[c].name,s:sc,l:cands[c].load})}
}
ranked.sort(function(a,b){return b.s-a.s});
var top=[];
for(var t=0;t<ranked.length&&t<3;t++){top.push(esc(ranked[t].n)+' '+ranked[t].s+'% ('+ranked[t].l+'h)')}
html+='<small style="margin-top:6px">Suggested volunteers: '+(top.length?top.join(', '):'none yet')+'</small>';
if(mine){
html+='<button class="btn" disabled>You are registered</button>';
}else if(spots<=0){
html+='<button class="btn" disabled>Full</button>';
}else if(blocked){
html+='<button class="btn" disabled>Not suitable for your needs</button>';
}else{
html+='<button class="btn joinDrive" data-id="'+d.id+'">Join this drive</button>';
}
html+='</div>';
}
$("drives").innerHTML=html;
var buttons=document.querySelectorAll(".joinDrive");
for(var j=0;j<buttons.length;j++){
buttons[j].addEventListener("click",function(){
if(!volunteer){
$("vMsg").textContent="Join as a volunteer first, using the form on the left.";
return;
}
$("vMsg").textContent="";
myDrives.push({driveId:parseInt(this.getAttribute("data-id")),present:false});
saveData();
renderDrives();
renderAttendance();
renderPool();
});
}
}

function renderPool(){
var all=pool.slice();
if(volunteer){all.push(asCandidate(volunteer))}
var rows='<tr style="font-weight:600"><td>Skill</td><td>Used for</td><td>Volunteers (hours this month)</td></tr>';
for(var i=0;i<SKILLS.length;i++){
var names=[];
for(var j=0;j<all.length;j++){
for(var k=0;k<all[j].skills.length;k++){
if(all[j].skills[k].s===SKILLS[i][0]){
names.push(esc(all[j].name)+(all[j].skills[k].v?'':'*')+' ('+all[j].load+'h)');
}
}
}
rows+='<tr><td>'+SKILLS[i][0]+'</td><td>'+SKILLS[i][1]+'</td><td>'+(names.length?names.join(', '):'None yet')+'</td></tr>';
}
$("pool").innerHTML=rows;
}

function renderAttendance(){
var done=0,hours=0;
var rows='<tr style="font-weight:600"><td>Drive</td><td>Date</td><td>Status</td></tr>';
if(myDrives.length===0){
rows+='<tr><td colspan="3">You have not joined any drive yet.</td></tr>';
}
for(var i=0;i<myDrives.length;i++){
var m=myDrives[i];
var d=findDrive(m.driveId);
if(!d){continue}
var status;
if(m.present){
status='<span class="tag">Present</span>';
done++;
hours+=d.hours;
}else if(d.date<=dateStr(0)){
status='<button class="btn markPresent" style="margin:0;padding:6px 12px" data-id="'+d.id+'">Mark present</button>';
}else{
status='Opens on drive day';
}
rows+='<tr><td>'+esc(d.title)+'<br><small>'+d.ngo+'</small></td><td>'+niceDate(d.date)+'</td><td>'+status+'</td></tr>';
}
$("att").innerHTML=rows;
$("aDone").textContent=done;
$("aHours").textContent=hours;
$("aRate").textContent=(myDrives.length?Math.round(done/myDrives.length*100):0)+"%";
var buttons=document.querySelectorAll(".markPresent");
for(var j=0;j<buttons.length;j++){
buttons[j].addEventListener("click",function(){
var rec=findMine(parseInt(this.getAttribute("data-id")));
if(rec){rec.present=true;saveData();renderAttendance()}
});
}
}

$("vJoin").addEventListener("click",function(){
var name=$("vName").value.trim();
if(!name){$("vMsg").textContent="Please enter your name.";return}
var boxes=document.querySelectorAll("#vSkills input:checked");
if(!boxes.length){$("vMsg").textContent="Pick at least one skill so we can match you to tasks.";return}
var skills=[];
for(var i=0;i<boxes.length;i++){skills.push({s:boxes[i].value,v:false})}
volunteer={name:name,area:$("vArea").value,skills:skills,avail:$("vAvail").value,access:$("vAccess").value};
$("vMsg").textContent="";
saveData();
renderVolunteer();
renderDrives();
renderPool();
});

$("dPost").addEventListener("click",function(){
var title=$("dTitle").value.trim();
var date=$("dDate").value;
if(!title||!date){$("vMsg").textContent="Add a drive title and a date.";return}
drives.push({id:nextDriveId,ngo:$("dNgo").value,title:title,date:date,need:parseInt($("dNeed").value)||1,filled:0,hours:parseInt($("dHours").value)||1,skill:$("dSkill").value,heavy:$("dHeavy").checked});
nextDriveId++;
$("dTitle").value="";
$("dHeavy").checked=false;
$("vMsg").textContent="";
saveData();
renderDrives();
renderPool();
});

var ngoOptions="";
for(var n=0;n<ngos.length;n++){
ngoOptions+='<option>'+ngos[n].name+'</option>';
}
$("dNgo").innerHTML=ngoOptions;
$("dDate").value=dateStr(1);

renderSkillPicker();
loadData();
for(var q=0;q<drives.length;q++){
if(!drives[q].skill){drives[q].skill="Sorting";drives[q].heavy=false}
}
if(volunteer&&!volunteer.skills){volunteer.skills=[]}
renderVolunteer();
renderDrives();
renderPool();
renderAttendance();

/* ---------- Expiry alerts and waste prevention ---------- */
var stock=[
{id:1,name:"Rice sacks (25 kg)",cat:"Food",qty:12,exp:dateStr(2)},
{id:2,name:"Cooking oil cans",cat:"Food",qty:10,exp:dateStr(6)},
{id:3,name:"ORS packets",cat:"Medicines",qty:60,exp:dateStr(-1)},
{id:4,name:"Paracetamol strips",cat:"Medicines",qty:80,exp:dateStr(45)},
{id:5,name:"Notebooks",cat:"Other supplies",qty:200,exp:""}
];
var nextStock=6,savedUnits=0;

function daysLeft(s){
if(!s){return null}
return Math.round((new Date(s+"T00:00:00")-new Date(dateStr(0)+"T00:00:00"))/86400000);
}

function stockState(it,win){
var d=daysLeft(it.exp);
if(d===null){return "none"}
if(d<0){return "expired"}
if(d<=win){return "soon"}
return "ok";
}

function suggestion(it,st){
if(st==="expired"){return "Do not distribute. Discard safely"+(it.cat==="Medicines"?" and follow medicine disposal rules.":".")}
if(st==="soon"){
if(it.cat==="Food"){return "Use in today's Narayan Seva meals first."}
if(it.cat==="Medicines"){return "Send to a partner clinic now. Have a pharmacist confirm before handing out."}
return "Offer to the nearest NGO that needs it."
}
return "";
}

function renderExpiry(){
var win=parseInt($("exWin").value)||7;
var list=stock.slice();
list.sort(function(a,b){
var da=daysLeft(a.exp),db=daysLeft(b.exp);
if(da===null&&db===null){return 0}
if(da===null){return 1}
if(db===null){return -1}
return da-db;
});
var soon=0,exp=0,html="";
for(var i=0;i<list.length;i++){
var it=list[i];
var st=stockState(it,win);
var d=daysLeft(it.exp);
if(st==="soon"){soon++}
if(st==="expired"){exp++}
var tag;
if(st==="expired"){tag='<span class="tag red">Expired '+Math.abs(d)+' day(s) ago</span>'}
else if(st==="soon"){tag='<span class="tag">'+(d===0?'Expires today':'Expires in '+d+' day(s)')+'</span>'}
else if(st==="ok"){tag='<span class="tag ok">Safe, '+d+' days left</span>'}
else{tag='<span class="tag ok">No expiry</span>'}
var tip=suggestion(it,st);
html+='<div class="item'+(st==="expired"?' exp':st==="soon"?' soon':'')+'"><div><h4>'+esc(it.name)+'</h4><small>'+it.cat+' | '+it.qty+' units'+(it.exp?' | '+niceDate(it.exp):'')+'</small>'+(tip?'<small>'+tip+'</small>':'')+'<div style="margin-top:6px">'+tag+'</div></div>';
if(st==="expired"){html+='<button class="btn ghost exAct" data-act="discard" data-id="'+it.id+'">Discard</button>'}
else{html+='<button class="btn exAct" data-act="give" data-id="'+it.id+'">Distribute</button>'}
html+='</div>';
}
$("exList").innerHTML=html||'<p class="empty">No stock added yet.</p>';
$("exSoon").textContent=soon;
$("exExp").textContent=exp;
$("exSaved").textContent=savedUnits;
var msg="";
if(exp||soon){
msg='<div class="alert"><b>Action needed:</b> ';
if(soon){msg+=soon+' item(s) expire within '+win+' days. '}
if(exp){msg+=exp+' item(s) have already expired and must be removed. '}
msg+='Distribute the earliest-expiring items first.</div>';
}else{
msg='<div class="alert good">All stock is within safe dates.</div>';
}
$("exAlert").innerHTML=msg;
var total=soon+exp;
$("expBadge").textContent=total?total:"";
var btns=document.querySelectorAll(".exAct");
for(var j=0;j<btns.length;j++){
btns[j].addEventListener("click",function(){
var id=parseInt(this.getAttribute("data-id"));
var act=this.getAttribute("data-act");
for(var k=0;k<stock.length;k++){
if(stock[k].id===id){
if(act==="give"){savedUnits+=stock[k].qty}
stock.splice(k,1);
break;
}
}
renderExpiry();
});
}
}

$("exAdd").addEventListener("click",function(){
var name=$("exName").value.trim();
if(!name){$("exMsg").textContent="Enter an item name.";return}
var cat=$("exCat").value;
var date=$("exDate").value;
if(!date&&cat!=="Other supplies"){$("exMsg").textContent="Food and medicines need an expiry date.";return}
$("exMsg").textContent="";
stock.push({id:nextStock,name:name,cat:cat,qty:parseInt($("exQty").value)||1,exp:date});
nextStock++;
$("exName").value="";
$("exDate").value="";
renderExpiry();
});
$("exWin").addEventListener("input",renderExpiry);
renderExpiry();

/* ---------- NGO emergency resource swap ---------- */
var swNgos=["Asha Bal Sadan","Shanti Vruddhashram","Vidya Kendra","Narayan Seva Kitchen"];
var swDist={"Asha Bal Sadan|Shanti Vruddhashram":9,"Asha Bal Sadan|Vidya Kendra":6,"Asha Bal Sadan|Narayan Seva Kitchen":5,"Shanti Vruddhashram|Vidya Kendra":7,"Shanti Vruddhashram|Narayan Seva Kitchen":8,"Vidya Kendra|Narayan Seva Kitchen":4};
function sd(a,b){if(a===b){return 0}return swDist[a+"|"+b]||swDist[b+"|"+a]||10}
var inv=[
{ngo:"Shanti Vruddhashram",item:"Blankets",qty:55,keep:15},
{ngo:"Narayan Seva Kitchen",item:"Rice (kg)",qty:120,keep:80},
{ngo:"Vidya Kendra",item:"Books",qty:300,keep:250},
{ngo:"Asha Bal Sadan",item:"Blankets",qty:5,keep:5}
];
var reqs=[
{id:1,ngo:"Asha Bal Sadan",item:"Blankets",qty:30,urg:9},
{id:2,ngo:"Shanti Vruddhashram",item:"Rice (kg)",qty:25,urg:7},
{id:3,ngo:"Asha Bal Sadan",item:"Books",qty:20,urg:5}
];
var vehicles=[
{id:1,ngo:"Vidya Kendra",name:"Tempo",cap:50,rate:18,free:true},
{id:2,ngo:"Asha Bal Sadan",name:"Auto",cap:15,rate:10,free:true},
{id:3,ngo:"Narayan Seva Kitchen",name:"Van",cap:100,rate:22,free:true}
];
var swLog=[],swPlan=null,nextReq=4;

function surplusOf(r){return Math.max(0,r.qty-r.keep)}

function buildPlan(req){
var sup=[];
for(var i=0;i<inv.length;i++){
if(inv[i].item===req.item&&inv[i].ngo!==req.ngo&&surplusOf(inv[i])>0){sup.push(inv[i])}
}
sup.sort(function(a,b){return sd(a.ngo,req.ngo)-sd(b.ngo,req.ngo)});
var need=req.qty,legs=[],total=0,noVeh=false;
for(var s=0;s<sup.length&&need>0;s++){
var row=sup[s];
var take=Math.min(need,surplusOf(row));
var best=null;
for(var v=0;v<vehicles.length;v++){
var veh=vehicles[v];
if(!veh.free){continue}
var trips=Math.ceil(take/veh.cap);
var km=sd(veh.ngo,row.ngo)+(2*trips-1)*sd(row.ngo,req.ngo);
var cost=km*veh.rate;
if(!best||cost<best.cost){best={veh:veh,trips:trips,km:km,cost:cost}}
}
if(!best){noVeh=true;continue}
legs.push({from:row.ngo,to:req.ngo,item:req.item,qty:take,vid:best.veh.id,vname:best.veh.name,vngo:best.veh.ngo,trips:best.trips,km:best.km,cost:best.cost});
total+=best.cost;
need-=take;
}
var parties=[];
function addP(n){if(parties.indexOf(n)===-1){parties.push(n)}}
if(legs.length){addP(req.ngo)}
for(var l=0;l<legs.length;l++){addP(legs[l].from);addP(legs[l].vngo)}
return {req:req.id,rng:req.ngo,item:req.item,legs:legs,short:need,total:total,noVeh:noVeh,parties:parties,approved:{}};
}

function renderSwap(){
var rs=reqs.slice().sort(function(a,b){return b.urg-a.urg});
var html="";
for(var i=0;i<rs.length;i++){
var r=rs[i];
html+='<div class="match"><h4>'+esc(r.ngo)+' needs '+r.qty+' '+esc(r.item)+' <span class="tag'+(r.urg>=8?' red':'')+'">Urgency '+r.urg+'/10</span></h4><button class="btn swFind" data-id="'+r.id+'" style="margin-top:8px;padding:8px 14px">Find transfer plan</button></div>';
}
$("swReqs").innerHTML=html||'<p class="empty">No open requests.</p>';
$("swBadge").textContent=reqs.length?reqs.length:"";
var f=document.querySelectorAll(".swFind");
for(var j=0;j<f.length;j++){
f[j].addEventListener("click",function(){
var id=parseInt(this.getAttribute("data-id"));
for(var k=0;k<reqs.length;k++){if(reqs[k].id===id){swPlan=buildPlan(reqs[k])}}
renderSwap();
});
}
var rows='<tr style="font-weight:600"><td>NGO</td><td>Item</td><td>Stock</td><td>Spare</td></tr>';
for(var a=0;a<inv.length;a++){
rows+='<tr><td>'+esc(inv[a].ngo)+'</td><td>'+esc(inv[a].item)+'</td><td>'+inv[a].qty+'</td><td>'+surplusOf(inv[a])+'</td></tr>';
}
$("swInv").innerHTML=rows;
var vr='<tr style="font-weight:600"><td>Vehicle</td><td>Capacity</td><td>Rate</td><td>Status</td></tr>';
for(var b=0;b<vehicles.length;b++){
var v=vehicles[b];
vr+='<tr><td>'+v.name+'<br><small>'+esc(v.ngo)+'</small></td><td>'+v.cap+' units</td><td>'+RUPEE+v.rate+'/km</td><td>'+(v.free?'Free':'On trip')+'</td></tr>';
}
$("swVeh").innerHTML=vr;
var lg="";
for(var c=0;c<swLog.length;c++){lg+='<div class="leg">'+swLog[c]+'</div>'}
$("swLog").innerHTML=lg||'<p class="empty">No transfers yet.</p>';
renderSwapPlan();
}

function renderSwapPlan(){
var p=swPlan;
if(!p){$("swPlan").innerHTML='<p class="empty">Pick a request and tap Find transfer plan.</p>';return}
var html='<p style="font-size:14px;margin-bottom:10px">For <b>'+esc(p.rng)+'</b>: '+esc(p.item)+'</p>';
if(!p.legs.length){
html+='<div class="alert">No plan possible. '+(p.noVeh?'No free vehicle is available right now.':'No NGO has spare '+esc(p.item)+'.')+'</div>';
$("swPlan").innerHTML=html;return;
}
for(var i=0;i<p.legs.length;i++){
var l=p.legs[i];
html+='<div class="leg"><b>Move '+l.qty+' '+esc(l.item)+'</b><br>'+esc(l.from)+' to '+esc(l.to)+'<small>'+l.vname+' from '+esc(l.vngo)+' | '+l.trips+' trip(s) | about '+l.km+' km | '+RUPEE+l.cost+'</small></div>';
}
html+='<p style="font-size:13px">Estimated total cost</p><div class="total">'+RUPEE+p.total+'</div>';
if(p.short>0){html+='<div class="alert">Only part of the need can be met. Short by '+p.short+'.</div>'}
html+='<h3 style="font-size:16px;margin:14px 0 4px">Approvals</h3>';
var all=true;
for(var k=0;k<p.parties.length;k++){
var n=p.parties[k];
var ok=p.approved[n];
if(!ok){all=false}
html+='<div class="appr"><span>'+esc(n)+'</span>'+(ok?'<span class="tag">Approved</span>':'<button class="btn ghost swAppr" data-n="'+esc(n)+'">Approve</button>')+'</div>';
}
html+='<button class="btn" id="swExec"'+(all?'':' disabled style="opacity:.5;cursor:not-allowed"')+'>Execute transfer</button><p id="swExecMsg" style="font-size:14px;color:var(--brick);margin-top:8px"></p>';
$("swPlan").innerHTML=html;
var ap=document.querySelectorAll(".swAppr");
for(var m=0;m<ap.length;m++){
ap[m].addEventListener("click",function(){swPlan.approved[this.getAttribute("data-n")]=true;renderSwapPlan()});
}
if(all){$("swExec").addEventListener("click",execSwap)}
}

function execSwap(){
var p=swPlan;
var copy=[];
for(var i=0;i<inv.length;i++){copy.push({ngo:inv[i].ngo,item:inv[i].item,qty:inv[i].qty,keep:inv[i].keep})}
var moved=0,vids=[];
for(var l=0;l<p.legs.length;l++){
var leg=p.legs[l];
var src=null,dst=null;
for(var c=0;c<copy.length;c++){
if(copy[c].ngo===leg.from&&copy[c].item===leg.item){src=copy[c]}
if(copy[c].ngo===leg.to&&copy[c].item===leg.item){dst=copy[c]}
}
var veh=null;
for(var v=0;v<vehicles.length;v++){if(vehicles[v].id===leg.vid){veh=vehicles[v]}}
if(!src||src.qty-src.keep<leg.qty||!veh||!veh.free){
$("swExecMsg").textContent="Stock or vehicle changed. Nothing was moved. Please find a new plan.";
return;
}
src.qty-=leg.qty;
if(!dst){dst={ngo:leg.to,item:leg.item,qty:0,keep:0};copy.push(dst)}
dst.qty+=leg.qty;dst.keep+=leg.qty;
moved+=leg.qty;
if(vids.indexOf(leg.vid)===-1){vids.push(leg.vid)}
}
inv=copy;
for(var u=0;u<vehicles.length;u++){if(vids.indexOf(vehicles[u].id)!==-1){vehicles[u].free=false}}
for(var r=0;r<reqs.length;r++){
if(reqs[r].id===p.req){
reqs[r].qty-=moved;
if(reqs[r].qty<=0){reqs.splice(r,1)}
break;
}
}
swLog.unshift('<b>'+moved+' '+esc(p.item)+' to '+esc(p.rng)+'</b><small>Approved by '+p.parties.map(esc).join(', ')+' | Cost '+RUPEE+p.total+'</small>');
swPlan=null;
renderSwap();
}

$("swPost").addEventListener("click",function(){
var q=parseInt($("swQty").value)||0;
if(q<1){$("swMsg").textContent="Enter a quantity.";return}
var u=Math.min(10,Math.max(1,parseInt($("swUrg").value)||5));
$("swMsg").textContent="";
reqs.push({id:nextReq,ngo:$("swNgo").value,item:$("swItem").value,qty:q,urg:u});
nextReq++;
renderSwap();
});
$("swFree").addEventListener("click",function(){
for(var i=0;i<vehicles.length;i++){vehicles[i].free=true}
renderSwap();
});
var swOpts="";
for(var o=0;o<swNgos.length;o++){swOpts+='<option>'+swNgos[o]+'</option>'}
$("swNgo").innerHTML=swOpts;
renderSwap();

/* ---------- About page shortcuts ---------- */
var goBtns=document.querySelectorAll("[data-go]");
for(var g=0;g<goBtns.length;g++){
goBtns[g].addEventListener("click",function(){
document.querySelector('[data-tab="'+this.getAttribute("data-go")+'"]').click();
window.scrollTo(0,0);
});
}

/* ---------- NGO self-registration ---------- */
var AREAS=["Kothrud","Baner","Hadapsar","Viman Nagar"];
var CATS=["Clothes","Books","Furniture","Appliances","Utensils"];
var REG_STEPS=["Application submitted","Documents checked","Field visit done","Approved and live"];
var REG_STORE="sevasetu-ngo-reg-v1";
var applications=[];

function saveApps(){
try{localStorage.setItem(REG_STORE,JSON.stringify(applications))}catch(e){}
}
function loadApps(){
try{
var raw=localStorage.getItem(REG_STORE);
if(raw){applications=JSON.parse(raw)}
}catch(e){}
}

function refreshNgoLists(){
var o1="",o2="";
for(var i=0;i<ngos.length;i++){o1+='<option>'+esc(ngos[i].name)+'</option>'}
for(var j=0;j<swNgos.length;j++){o2+='<option>'+esc(swNgos[j])+'</option>'}
var d=$("dNgo").value,s=$("swNgo").value;
$("dNgo").innerHTML=o1;
$("swNgo").innerHTML=o2;
if(d){$("dNgo").value=d}
if(s){$("swNgo").value=s}
}

function goLive(a){
for(var i=0;i<ngos.length;i++){if(ngos[i].name===a.name){return}}
var dist={};
for(var k=0;k<AREAS.length;k++){dist[AREAS[k]]=(AREAS[k]===a.area)?2:9}
ngos.push({name:a.name,type:a.type,needs:a.needs,urgency:5,dist:dist});
swNgos.push(a.name);
refreshNgoLists();
}

function renderApps(){
if(!applications.length){
$("rApps").innerHTML='<p class="empty">No applications yet. Submit the form to start verification.</p>';
return;
}
var html="";
for(var i=applications.length-1;i>=0;i--){
var a=applications[i];
var live=a.stage>=REG_STEPS.length-1;
html+='<div class="match"><h4>'+esc(a.name)+' <span class="tag'+(live?'':' ok')+'">'+(live?'Live on Sevadeep':'Under review')+'</span></h4>';
html+='<small>'+esc(a.type)+' | '+esc(a.area)+' | Reg no. '+esc(a.reg)+' | Ref '+a.id+'</small>';
html+='<small style="display:block">Needs: '+esc(a.needs.join(", "))+' | Certificate: '+esc(a.doc)+'</small>';
html+='<ul class="tl">';
for(var s=0;s<REG_STEPS.length;s++){
html+='<li class="'+(s<=a.stage?'done':'')+'"><b>'+REG_STEPS[s]+'</b><span>'+(s<=a.stage?'Done':'Waiting')+'</span></li>';
}
html+='</ul>';
if(!live){html+='<button class="btn gold regAdv" data-id="'+a.id+'" style="margin-top:4px;padding:8px 14px">Next step (demo: Sevadeep team)</button>'}
html+='</div>';
}
$("rApps").innerHTML=html;
var b=document.querySelectorAll(".regAdv");
for(var j=0;j<b.length;j++){
b[j].addEventListener("click",function(){
var id=this.getAttribute("data-id");
for(var k=0;k<applications.length;k++){
if(applications[k].id===id){
applications[k].stage++;
if(applications[k].stage>=REG_STEPS.length-1){goLive(applications[k])}
}
}
saveApps();
renderApps();
});
}
}

$("rSubmit").addEventListener("click",function(){
var name=$("rName").value.trim();
var reg=$("rReg").value.trim();
var contact=$("rContact").value.trim();
var phone=$("rPhone").value.trim();
var email=$("rEmail").value.trim();
var boxes=document.querySelectorAll("#rNeeds input:checked");
var file=$("rDoc").files[0];
var msg="";
if(!name||!reg||!contact){msg="Fill in the NGO name, registration number and contact person."}
else if(!/^[6-9]\d{9}$/.test(phone)){msg="Enter a valid 10 digit Indian mobile number."}
else if(!/^\S+@\S+\.\S+$/.test(email)){msg="Enter a valid email address."}
else if(!boxes.length){msg="Pick at least one item your NGO needs."}
else if(!file){msg="Upload your registration certificate."}
else if(!$("rConsent").checked){msg="Please confirm the details and consent to verification."}
else{
for(var i=0;i<applications.length;i++){
if(applications[i].reg.toLowerCase()===reg.toLowerCase()){msg="An application with this registration number already exists."}
if(applications[i].name.toLowerCase()===name.toLowerCase()){msg="An NGO with this name is already registered."}
}
for(var n=0;n<ngos.length;n++){
if(ngos[n].name.toLowerCase()===name.toLowerCase()){msg="An NGO with this name is already registered."}
}
}
if(msg){$("rMsg").textContent=msg;return}
var needs=[];
for(var b=0;b<boxes.length;b++){needs.push(boxes[b].value)}
applications.push({id:"SN-"+(2001+applications.length),name:name,type:$("rType").value,reg:reg,contact:contact,phone:phone,email:email,area:$("rArea").value,needs:needs,doc:file.name,stage:0,date:dateStr(0)});
saveApps();
$("rMsg").textContent="";
$("rName").value="";$("rReg").value="";$("rContact").value="";$("rPhone").value="";$("rEmail").value="";$("rDoc").value="";$("rConsent").checked=false;
for(var c=0;c<boxes.length;c++){boxes[c].checked=false}
renderApps();
});

var needHtml="";
for(var cI=0;cI<CATS.length;cI++){
needHtml+='<label class="chip"><input type="checkbox" value="'+CATS[cI]+'"> '+CATS[cI]+'</label>';
}
$("rNeeds").innerHTML=needHtml;

loadApps();
for(var ap=0;ap<applications.length;ap++){
if(applications[ap].stage>=REG_STEPS.length-1){goLive(applications[ap])}
}
renderApps();