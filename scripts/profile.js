window.onload=()=>{
    let id=window.location.pathname.split('/profile')[1]
    fetch(`/search${id}`,
    {
        method:'post',
        mode:'cors',
        // body : JSON.stringify({'querry':querry,'limit':5}),
        headers: {"Content-type": "application/json; charset=UTF-8"},
    }
    ).then((resp)=>resp.json())
    .then((resp)=>{
        
        if(resp.ok){
            
            document.getElementById("name").innerHTML=resp.data.name
            // document.getElementById("uid").innerHTML='@'+id.substring(1)
            document.getElementById("bio").innerHTML=resp.data.bio
            document.getElementById("email").href="mailto:"+resp.data.email
            document.getElementById("phone").href="tel:+91"+resp.data.phone
            document.getElementById("insta").href=esp.data.insta
        }else{
           
        }
    })    


}