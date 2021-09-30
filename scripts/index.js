window.onload=()=>{
    let url=""

    $("#view")[0].onclick=()=>window.location.href+='profile/'+url
    $("#save")[0].onclick=()=>{
        fetch(`/save`,
        {
            method:'post',
            mode:'cors',
            body : JSON.stringify({'name':$("#name")[0].value,'bio':$("#bio")[0].value,
            'insta':$("#insta")[0].value,'twitter':$("#twitter")[0].value,'phone':$("#phn")[0].value }),
            headers: {"Content-type": "application/json; charset=UTF-8"},
        })
        
    }
    fetch(`/search`,
    {
        method:'get',
        mode:'cors',
        // body : JSON.stringify({'name':$("#name")[0].value,'bio':$("#bio")[0].innerText,
        // 'insta':$("#insta")[0].value,'twitter':$("#twitter")[0].value,'phone':$("#phn")[0].value }),
        headers: {"Content-type": "application/json; charset=UTF-8"},
    }
    ).then((resp)=>resp.json())
    .then((resp)=>{
        
        if(resp.ok){
            
            $("#name")[0].value=resp.data.name
            $("#bio")[0].innerText=resp.data.bio
            $("#insta")[0].value=resp.data.insta
            $("#twitter")[0].value=resp.data.twitter
            $("#phn")[0].value=resp.data.phone
            url=resp.data.id
        }else{
           
        }
    })    


}