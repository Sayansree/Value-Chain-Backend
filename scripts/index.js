
window.onload = ()=>{
    //refresh();
    const search=document.getElementById("search");
    const  find=document.getElementById("find");
    window.renderEntries = (ent)=>{
        let list=`
        <ol>`
        for( e of ent){
           list+= `<li><a href="/profile/${e.id}">${e.name}</a></li>`
        }
        list+="</ol>"
        document.getElementById("results").innerHTML=list
        console.log(ent)
    }
    search.onchange = async()=>{
            const msg=document.getElementById("msg");
            msg.style.color="blue"
            msg.innerHTML= "loading...";
            fetch('/search',
            {
                method:'post',
                mode:'cors',
                body : JSON.stringify({'querry':search.value,'limit':10}),
                headers: {"Content-type": "application/json; charset=UTF-8"},
            }
            ).then((resp)=>resp.json())
            .then((resp)=>{
                if(resp.ok){
                msg.style.color="green"
                msg.innerHTML= `found ${resp.data.length} entries`;
                renderEntries(resp.data)
                }else{
                    msg.style.color="red"
                    msg.innerHTML= "couldn't commit try reloading the page";
                }
            })
           .catch(()=>{msg.style.color="orange"
           msg.innerHTML= "connection error";})
        }
        find.onclick = async()=>{
            const msg=document.getElementById("msg");
            msg.style.color="blue"
            msg.innerHTML= "loading...";
            var resp = await fetch('/find',
            {
                method:'post',
                mode:'cors',
                body : JSON.stringify({'radius':5,'limit':10}),
                headers: {"Content-type": "application/json; charset=UTF-8"},
            }
            ).then((resp)=>resp.json())
            .then((resp)=>{
                if(resp.ok){
                msg.style.color="green"
                msg.innerHTML= resp.data;
                refresh();
                }else{
                    msg.style.color="red"
                    msg.innerHTML= "couldn't commit try reloading the page";
                }
            })
           .catch(()=>{msg.style.color="orange"
           msg.innerHTML= "connection error";})
        }

}
const refresh =async()=>{
    
    const name=document.getElementById("name");
    const email=document.getElementById("email");
    const phn=document.getElementById("phn");
    const gr1=document.getElementById("gr1");
    const gr2=document.getElementById("gr2");
    const msg=document.getElementById("msg");
            msg.style.color="blue"
            msg.innerHTML= "loading...";
    var resp = await fetch('https://rainbow-family.herokuapp.com/ss/173decd41d081bc8aeee04ea1be4fd210fd7667a569c67835980ad1496928f47203f6262dd9d0ffc0120e1d2019f804a449f7b780a8b1c30342585cfba94bd17',
    {
        method:'get',
        mode:'cors',
        headers: {"Content-type": "application/json; charset=UTF-8"},
    }
    ).then((resp)=>resp.json())
    .then((resp)=>{
        if(resp.pass){
        let data = resp.data;
        name.innerHTML="name: " +data.name;
        email.innerHTML="email: " +data.email;
        phn.innerHTML="phone:  "+data.phone;
        let url= `https://image-charts.com/chart?chd=t%3A${data.m0}%2C${data.m1}%2C${data.m2}%2C${data.m3}%2C${data.m4}%2C${data.m5}%2C${data.m6}%2C${data.m7}%2C${data.m8}%2C${data.m9}%2C${data.m10}%2C${data.m11}&chf=b0%2Clg%2C0%2Cfdb45c%2C0%2Ced7e30%2C1&chs=999x300&cht=bvs&chbr=10&chxl=1%3A%7CJan%7CFev%7CMar%7CApr%7CMay%7CJun%7CJul%7CAug%7CSep%7COct%7CNov%7CDec&chxt=y%2Cx`
        let url2=`https://image-charts.com/chart?chbh=a&chbr=10&chco=fdb45c%2C27c9c2%2C1869b7&chd=t%3A${data.m0}%2C${data.m1}%2C${data.m2}%2C${data.m3}%2C${data.m4}%2C${data.m5}%2C${data.m6}%2C${data.m7}%2C${data.m8}%2C${data.m9}%2C${data.m10}%2C${data.m11}%7C${data.am0}%2C${data.am1}%2C${data.am2}%2C${data.am3}%2C${data.am4}%2C${data.am5}%2C${data.am6}%2C${data.am7}%2C${data.am8}%2C${data.am9}%2C${data.am10}%2C${data.am11}&chds=0%2C120&chm=N%2C000000%2C0%2C%2C10%7CN%2C000000%2C1%2C%2C10%7CN%2C000000%2C2%2C%2C10&chma=0%2C0%2C10%2C10&chs=999x300&cht=bvg&chxs=0%2C000000%2C0%2C0%2C_&chxt=y`
        gr1.src=url
        gr2.src=url2
        msg.style.color="green"
        msg.innerHTML= "successfully fetched user data";

    }  else{
        msg.style.color="red"
        msg.innerHTML= "couldn't fetch user data try reloading the page";
    }
    })
   .catch(()=>{console.log('fail')})
}