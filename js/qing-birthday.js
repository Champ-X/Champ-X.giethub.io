function initVars(){

    pi=Math.PI;
    ctx=canvas.getContext("2d");
    canvas.width=canvas.clientWidth;
    canvas.height=canvas.clientHeight;
    cx=canvas.width/2;
    cy=canvas.height/2;
    playerZ=-25;
    playerX=playerY=playerVX=playerVY=playerVZ=pitch=yaw=pitchV=yawV=0;
    scale=600;
    seedTimer=0;seedInterval=5,seedLife=100;gravity=.02;
    seeds=new Array();
    sparkPics=new Array();
    s="https://cantelope.org/NYE/";
    for(i=1;i<=10;++i){
        sparkPic=new Image();
        sparkPic.src=s+"spark"+i+".png";
        sparkPics.push(sparkPic);
    }
    sparks=new Array();
    pow1=new Audio(s+"pow1.ogg");
    pow2=new Audio(s+"pow2.ogg");
    pow3=new Audio(s+"pow3.ogg");
    pow4=new Audio(s+"pow4.ogg");
    frames = 0;
}

function rasterizePoint(x,y,z){

    var p,d;
    x-=playerX;
    y-=playerY;
    z-=playerZ;
    p=Math.atan2(x,z);
    d=Math.sqrt(x*x+z*z);
    x=Math.sin(p-yaw)*d;
    z=Math.cos(p-yaw)*d;
    p=Math.atan2(y,z);
    d=Math.sqrt(y*y+z*z);
    y=Math.sin(p-pitch)*d;
    z=Math.cos(p-pitch)*d;
    var rx1=-1000,ry1=1,rx2=1000,ry2=1,rx3=0,ry3=0,rx4=x,ry4=z,uc=(ry4-ry3)*(rx2-rx1)-(rx4-rx3)*(ry2-ry1);
    if(!uc) return {x:0,y:0,d:-1};
    var ua=((rx4-rx3)*(ry1-ry3)-(ry4-ry3)*(rx1-rx3))/uc;
    var ub=((rx2-rx1)*(ry1-ry3)-(ry2-ry1)*(rx1-rx3))/uc;
    if(!z)z=.000000001;
    if(ua>0&&ua<1&&ub>0&&ub<1){
        return {
            x:cx+(rx1+ua*(rx2-rx1))*scale,
            y:cy+y/z*scale,
            d:Math.sqrt(x*x+y*y+z*z)
        };
    }else{
        return {
            x:cx+(rx1+ua*(rx2-rx1))*scale,
            y:cy+y/z*scale,
            d:-1
        };
    }
}

function spawnSeed(){

    seed=new Object();
    seed.x=-50+Math.random()*100;
    seed.y=25;
    seed.z=-50+Math.random()*100;
    seed.vx=.1-Math.random()*.2;
    seed.vy=-1.5;//*(1+Math.random()/2);
    seed.vz=.1-Math.random()*.2;
    seed.born=frames;
    seeds.push(seed);
}

function splode(x,y,z){

    t=5+parseInt(Math.random()*150);
    sparkV=1+Math.random()*2.5;
    type=parseInt(Math.random()*3);
    switch(type){
        case 0:
            pic1=parseInt(Math.random()*10);
            break;
        case 1:
            pic1=parseInt(Math.random()*10);
            do{ pic2=parseInt(Math.random()*10); }while(pic2==pic1);
            break;
        case 2:
            pic1=parseInt(Math.random()*10);
            do{ pic2=parseInt(Math.random()*10); }while(pic2==pic1);
            do{ pic3=parseInt(Math.random()*10); }while(pic3==pic1 || pic3==pic2);
            break;
    }
    for(m=1;m<t;++m){
        spark=new Object();
        spark.x=x; spark.y=y; spark.z=z;
        p1=pi*2*Math.random();
        p2=pi*Math.random();
        v=sparkV*(1+Math.random()/6)
        spark.vx=Math.sin(p1)*Math.sin(p2)*v;
        spark.vz=Math.cos(p1)*Math.sin(p2)*v;
        spark.vy=Math.cos(p2)*v;
        switch(type){
            case 0: spark.img=sparkPics[pic1]; break;
            case 1:
                spark.img=sparkPics[parseInt(Math.random()*2)?pic1:pic2];
                break;
            case 2:
                switch(parseInt(Math.random()*3)){
                    case 0: spark.img=sparkPics[pic1]; break;
                    case 1: spark.img=sparkPics[pic2]; break;
                    case 2: spark.img=sparkPics[pic3]; break;
                }
                break;
        }
        spark.radius=25+Math.random()*50;
        spark.alpha=1;
        spark.trail=new Array();
        sparks.push(spark);
    }
    switch(parseInt(Math.random()*4)){
        case 0:	pow=new Audio(s+"pow1.ogg"); break;
        case 1:	pow=new Audio(s+"pow2.ogg"); break;
        case 2:	pow=new Audio(s+"pow3.ogg"); break;
        case 3:	pow=new Audio(s+"pow4.ogg"); break;
    }
    d=Math.sqrt((x-playerX)*(x-playerX)+(y-playerY)*(y-playerY)+(z-playerZ)*(z-playerZ));
    pow.volume=3/(1+d/10);
    pow.play();
}

function doLogic(){

    if(seedTimer<frames){
        seedTimer=frames+seedInterval*Math.random()*10;
        spawnSeed();
    }
    for(i=0;i<seeds.length;++i){
        seeds[i].vy+=gravity;
        seeds[i].x+=seeds[i].vx;
        seeds[i].y+=seeds[i].vy;
        seeds[i].z+=seeds[i].vz;
        if(frames-seeds[i].born>seedLife){
            splode(seeds[i].x,seeds[i].y,seeds[i].z);
            seeds.splice(i,1);
        }
    }
    for(i=0;i<sparks.length;++i){
        if(sparks[i].alpha>0 && sparks[i].radius>5){
            sparks[i].alpha-=.01;
            sparks[i].radius/=1.02;
            sparks[i].vy+=gravity;
            point=new Object();
            point.x=sparks[i].x;
            point.y=sparks[i].y;
            point.z=sparks[i].z;
            if(sparks[i].trail.length){
                x=sparks[i].trail[sparks[i].trail.length-1].x;
                y=sparks[i].trail[sparks[i].trail.length-1].y;
                z=sparks[i].trail[sparks[i].trail.length-1].z;
                d=((point.x-x)*(point.x-x)+(point.y-y)*(point.y-y)+(point.z-z)*(point.z-z));
                if(d>9){
                    sparks[i].trail.push(point);
                }
            }else{
                sparks[i].trail.push(point);
            }
            if(sparks[i].trail.length>5)sparks[i].trail.splice(0,1);
            sparks[i].x+=sparks[i].vx;
            sparks[i].y+=sparks[i].vy;
            sparks[i].z+=sparks[i].vz;
            sparks[i].vx/=1.075;
            sparks[i].vy/=1.075;
            sparks[i].vz/=1.075;
        }else{
            sparks.splice(i,1);
        }
    }
    p=Math.atan2(playerX,playerZ);
    d=Math.sqrt(playerX*playerX+playerZ*playerZ);
    d+=Math.sin(frames/80)/1.25;
    t=Math.sin(frames/200)/40;
    playerX=Math.sin(p+t)*d;
    playerZ=Math.cos(p+t)*d;
    yaw=pi+p+t;
}

function rgb(col){

    var r = parseInt((.5+Math.sin(col)*.5)*16);
    var g = parseInt((.5+Math.cos(col)*.5)*16);
    var b = parseInt((.5-Math.sin(col)*.5)*16);
    return "#"+r.toString(16)+g.toString(16)+b.toString(16);
}

function draw(){

    ctx.clearRect(0,0,cx*2,cy*2);

    ctx.fillStyle="#ff8";
    for(i=-100;i<100;i+=3){
        for(j=-100;j<100;j+=4){
            x=i;z=j;y=25;
            point=rasterizePoint(x,y,z);
            if(point.d!=-1){
                size=250/(1+point.d);
                d = Math.sqrt(x * x + z * z);
                a = 0.75 - Math.pow(d / 100, 6) * 0.75;
                if(a>0){
                    ctx.globalAlpha = a;
                    ctx.fillRect(point.x-size/2,point.y-size/2,size,size);
                }
            }
        }
    }
    ctx.globalAlpha=1;
    for(i=0;i<seeds.length;++i){
        point=rasterizePoint(seeds[i].x,seeds[i].y,seeds[i].z);
        if(point.d!=-1){
            size=200/(1+point.d);
            ctx.fillRect(point.x-size/2,point.y-size/2,size,size);
        }
    }
    point1=new Object();
    for(i=0;i<sparks.length;++i){
        point=rasterizePoint(sparks[i].x,sparks[i].y,sparks[i].z);
        if(point.d!=-1){
            size=sparks[i].radius*200/(1+point.d);
            if(sparks[i].alpha<0)sparks[i].alpha=0;
            if(sparks[i].trail.length){
                point1.x=point.x;
                point1.y=point.y;
                switch(sparks[i].img){
                    case sparkPics[0]:ctx.strokeStyle="#f84";break;
                    case sparkPics[1]:ctx.strokeStyle="#84f";break;
                    case sparkPics[2]:ctx.strokeStyle="#8ff";break;
                    case sparkPics[3]:ctx.strokeStyle="#fff";break;
                    case sparkPics[4]:ctx.strokeStyle="#4f8";break;
                    case sparkPics[5]:ctx.strokeStyle="#f44";break;
                    case sparkPics[6]:ctx.strokeStyle="#f84";break;
                    case sparkPics[7]:ctx.strokeStyle="#84f";break;
                    case sparkPics[8]:ctx.strokeStyle="#fff";break;
                    case sparkPics[9]:ctx.strokeStyle="#44f";break;
                }
                for(j=sparks[i].trail.length-1;j>=0;--j){
                    point2=rasterizePoint(sparks[i].trail[j].x,sparks[i].trail[j].y,sparks[i].trail[j].z);
                    if(point2.d!=-1){
                        ctx.globalAlpha=j/sparks[i].trail.length*sparks[i].alpha/2;
                        ctx.beginPath();
                        ctx.moveTo(point1.x,point1.y);
                        ctx.lineWidth=1+sparks[i].radius*10/(sparks[i].trail.length-j)/(1+point2.d);
                        ctx.lineTo(point2.x,point2.y);
                        ctx.stroke();
                        point1.x=point2.x;
                        point1.y=point2.y;
                    }
                }
            }
            ctx.globalAlpha=sparks[i].alpha;
            ctx.drawImage(sparks[i].img,point.x-size/2,point.y-size/2,size,size);
        }
    }
}

function frame(){

    if(frames>100000){
        seedTimer=0;
        frames=0;
    }
    frames++;
    draw();
    doLogic();
    requestAnimationFrame(frame);
}

window.addEventListener("resize",()=>{
    canvas.width=canvas.clientWidth;
    canvas.height=canvas.clientHeight;
    cx=canvas.width/2;
    cy=canvas.height/2;
});
// Import the data to customize and insert them into page
const fetchData = () => {
    fetch("customize.json")
        .then(data => data.json())
        .then(data => {
            dataArr = Object.keys(data);
            dataArr.map(customData => {
                if (data[customData] !== "") {
                    if (customData === "imagePath") {
                        document
                            .querySelector(`[data-node-name*="${customData}"]`)
                            .setAttribute("src", data[customData]);
                    } else {
                        document.querySelector(`[data-node-name*="${customData}"]`).innerText = data[customData];
                    }
                }

                // Check if the iteration is over
                // Run amimation if so
                if ( dataArr.length === dataArr.indexOf(customData) + 1 ) {
                    animationTimeline();
                }
            });
        });
};

// Animation Timeline
const animationTimeline = () => {
    // Spit chars that needs to be animated individually
    const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
    const hbd = document.getElementsByClassName("wish-hbd")[0];

    textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
        .split("")
        .join("</span><span>")}</span`;

    hbd.innerHTML = `<span>${hbd.innerHTML
        .split("")
        .join("</span><span>")}</span`;

    const ideaTextTrans = {
        opacity: 0,
        y: -20,
        rotationX: 5,
        skewX: "15deg"
    };

    const ideaTextTransLeave = {
        opacity: 0,
        y: 20,
        rotationY: 5,
        skewX: "-15deg"
    };

    const tl = new TimelineMax();

    tl
        .to(".container", 3.1, {
            visibility: "visible"
        })
        .from(".one", 2.7, {
            opacity: 0,
            y: 10
        })
        .from(".two", 1.4, {
            opacity: 0,
            y: 10
        })
        .to(
            ".one",
            2.7,
            {
                opacity: 0,
                y: 10
            },
            "+=2.5"
        )
        .to(
            ".two",
            1.7,
            {
                opacity: 0,
                y: 10
            },
            "-=1"
        )
        .from(".three", 1.7, {
            opacity: 0,
            y: 10
            // scale: 0.7
        })
        .to(
            ".three",
            1.7,
            {
                opacity: 0,
                y: 10
            },
            "+=2"
        )
        .from(".four", 1.7, {
            scale: 0.2,
            opacity: 0
        })
        .from(".fake-btn", 1.3, {
            scale: 0.2,
            opacity: 0
        })
        .staggerTo(
            ".hbd-chatbox span",
            0.5,
            {
                visibility: "visible"
            },
            0.05
        )
        .to(".fake-btn", 0.1, {
            backgroundColor: "rgb(127, 206, 248)"
        })
        .to(
            ".four",
            1.5,
            {
                scale: 0.2,
                opacity: 0,
                y: -150
            },
            "+=0.7"
        )
        .from(".idea-1", 1.7, ideaTextTrans)
        .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
        .from(".idea-2", 1.7, ideaTextTrans)
        .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
        .from(".idea-3", 1.7, ideaTextTrans)
        .to(".idea-3 strong", 0.5, {
            scale: 1.2,
            x: 10,
            backgroundColor: "rgb(21, 161, 237)",
            color: "#fff"
        })
        .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
        .from(".idea-4", 0.7, ideaTextTrans)
        .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
        .from(
            ".idea-5",
            0.7,
            {
                rotationX: 15,
                rotationZ: -10,
                skewY: "-5deg",
                y: 50,
                z: 10,
                opacity: 0
            },
            "+=0.5"
        )
        .to(
            ".idea-5 .smiley",
            0.7,
            {
                rotation: 90,
                x: 8
            },
            "+=0.4"
        )
        .to(
            ".idea-5",
            0.7,
            {
                scale: 0.2,
                opacity: 0
            },
            "+=2"
        )
        .staggerFrom(
            ".idea-6 span",
            0.8,
            {
                scale: 3,
                opacity: 0,
                rotation: 15,
                ease: Expo.easeOut
            },
            0.2
        )
        .staggerTo(
            ".idea-6 span",
            0.8,
            {
                scale: 3,
                opacity: 0,
                rotation: -15,
                ease: Expo.easeOut
            },
            0.2,
            "+=1"
        )
        .staggerFromTo(
            ".baloons img",
            2.5,
            {
                opacity: 0.9,
                y: 1400
            },
            {
                opacity: 1,
                y: -1000
            },
            0.2
        )
        .from(
            ".lydia-dp",
            0.5,
            {
                scale: 3.5,
                opacity: 0,
                x: 25,
                y: -25,
                rotationZ: -45
            },
            "-=2"
        )
        .from(".hat", 0.5, {
            x: -100,
            y: 350,
            rotation: -180,
            opacity: 0
        })
        .staggerFrom(
            ".wish-hbd span",
            0.7,
            {
                opacity: 0,
                y: -50,
                // scale: 0.3,
                rotation: 150,
                skewX: "30deg",
                ease: Elastic.easeOut.config(1, 0.5)
            },
            0.1
        )
        .staggerFromTo(
            ".wish-hbd span",
            0.7,
            {
                scale: 1.4,
                rotationY: 150
            },
            {
                scale: 1,
                rotationY: 0,
                color: "#ff4c54",
                ease: Expo.easeOut
            },
            0.1,
            "party"
        )
        .from(
            ".wish h5",
            0.5,
            {
                opacity: 0,
                y: 10,
                skewX: "-15deg"
            },
            "party"
        )
        .staggerTo(
            ".eight svg",
            1.5,
            {
                visibility: "visible",
                opacity: 0,
                scale: 80,
                repeat: 3,
                repeatDelay: 1.4
            },
            0.3
        )
        .to(".six", 0.5, {
            opacity: 0,
            y: 30,
            zIndex: "-1"
        })
        .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
        .to(
            ".last-smile",
            0.5,
            {
                rotation: 0
            },
            "+=1"
        );

    // tl.seek("currentStep");
    // tl.timeScale(2);

    // Restart Animation on click
    const replyBtn = document.getElementById("replay");
    replyBtn.addEventListener("click", () => {
        tl.restart();
    });
};

initVars();
frame();
fetchData();
