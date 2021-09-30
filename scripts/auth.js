window.onload =()=>{
    const signup=document.getElementById("form-signup");
    const forgot=document.getElementById("form-forgot");
    const login=document.getElementById("form-login");
    const form= document.getElementById("form");
    const btnsignup=document.getElementById("btn-signup");
    const btnlogin=document.getElementById("btn-login");
    const btnforgot=document.getElementById("btn-forgot");
    const loginbtn=document.getElementById("login");
    const signupbtn=document.getElementById("signup");
    const msglogin=document.getElementById("login-msg");
    const msgsignup=document.getElementById("sign-msg");
    const tablinks = document.getElementsByClassName("tablinks");
    signup.style.display="none";
    forgot.style.display="none";
    window.login = () => {
        form.style.display='block'
    
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        tablinks[0].className+=" active"
        login.style.display="block";
        signup.style.display="none";
        forgot.style.display="none"; 
  
    }
    window.signUp = () => {
        form.style.display='block'
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        tablinks[1].className+=" active"
        login.style.display="none";
        signup.style.display="block";
        forgot.style.display="none";
    }
    window.forgot = () => {
        form.style.display='none'
        login.style.display="none"; 
        signup.style.display="none";
        forgot.style.display="block"; 
      }
    loginbtn.onclick = async () => {
        const email=document.getElementById("login-email").value;
        const pass=document.getElementById("login-pass").value;
        msglogin.innerHTML= "loading...";
        msglogin.style.color = "blue";
        fetch('/login',
        {
            method:'post',
            mode:'cors',
            credentials: 'same-origin',
            body : JSON.stringify({'email':email,'password':CryptoJS.SHA512(pass).toString()}),
            headers: {"Content-type": "application/json; charset=UTF-8"},
        }
        ).then((resp)=>resp.json())
        .then((resp)=>{
                if(resp.pass){
                    msglogin.innerHTML = "login successful";
                    msglogin.style.color = "green";
                    setTimeout(()=>window.open("/","_self"),2000);
                }else if(resp.email){
                    msglogin.style.color = "red";
                    msglogin.innerHTML = "incorrect password";
                }else{
                    msglogin.style.color = "red";
                    msglogin.innerHTML = "account not registered with the current email, register your account first ";
                }
            })
        .catch(()=>{ 
            msglogin.style.color = "red";
            msglogin.innerHTML = "connection error";
        })
    }
    window.locError=(error)=>{
        msgsignup.style.color = "red";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msgsignup.innerHTML = "User denied the request for Geolocation."
            break;
          case error.POSITION_UNAVAILABLE:
            msgsignup.innerHTML = "Location information is unavailable."
            break;
          case error.TIMEOUT:
            msgsignup.innerHTML = "The request to get user location timed out."
            break;
          case error.UNKNOWN_ERROR:
            msgsignup.innerHTML = "An unknown error occurred."
            break;
        }
      }
    window.register= async(pos)=>{
        const email=document.getElementById("sign-email").value;
        const pass=document.getElementById("sign-pass").value;
        const uname=document.getElementById("sign-uname").value;
        const bio=document.getElementById("sign-bio").value;
        const phone=document.getElementById("sign-phn").value;
        msgsignup.innerHTML= "loading...";
        msgsignup.style.color = "blue";
        fetch('/signup',
        {
            method:'post',
            mode:'cors',
            credentials: 'same-origin',
            body : JSON.stringify({'loc':{'lat': pos.coords.latitude,'long':pos.coords.longitude},'bio':bio,'phone':phone,'username':uname,'email':email,'password':CryptoJS.SHA512(pass).toString()}),
            headers: {"Content-type": "application/json; charset=UTF-8"},
        }
        ).then((resp)=>resp.json())
        .then((resp)=>{
            if (resp.exists){
                if(resp.verify){
                    msgsignup.style.color = "red";
                    msgsignup.innerHTML= "account already registered  with this email please login ";
                }else{
                    msgsignup.style.color = "orange";
                    msgsignup.innerHTML= "account registered not yet verified, to verify click on link in your inbox";
                }
            }else if(resp.verify){
                msgsignup.style.color = "green";
                msgsignup.innerHTML= "your account has been successfully registered, to verify click on link in your inbox";
                setTimeout(()=>window.open("/verify","_self"),2000);
            }else{
                msgsignup.style.color = "yellow";
                msgsignup.innerHTML= "some error occoured, try again";
            }
        }).catch(()=>{
            msgsignup.style.color = "red";
            msgsignup.innerHTML = "connection error";
        })
    }
    
    signupbtn.onclick = async() => {
        register({'coords':{'longitude':0,'latitude':0}})
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(register,locError);
        // } else {
        //     msgsignup.style.color = "red";
        //     msgsignup.innerHTML = "loctation is not supported unable to register";
        // }
        
    }
    window.openTab =(evt, tabName)=> {
        // Declare all variables
        var i, tabcontent;
      
        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
      
        // Get all elements with class="tablinks" and remove the class "active"
        
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
      
        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
      }
}