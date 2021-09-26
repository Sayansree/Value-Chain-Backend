
const processQuerry= async (qry)=>{
    fetch('/querry',
        {
            method:'post',
            mode:'cors',
            credentials: 'same-origin',
            body : JSON.stringify({querry:qry}),
            headers: {"Content-type": "application/json; charset=UTF-8"},
        }
        ).then((resp)=>resp.json())
        .then((resp)=>{
            if(resp.ok)
            {
                console.log(resp.data)
            }else{
                console.log('querry error')
            }
        })
        .catch(()=>{
            console.log('error')
        })
}



window.onload=async ()=>{
    const table=document.getElementById('table')
    await processQuerry(`select id,name,accesslevel from users;`)
}