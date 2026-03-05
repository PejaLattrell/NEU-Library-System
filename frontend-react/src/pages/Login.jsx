import { auth } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();

function Login() {

    const login = async () => {
        try {
            await signInWithPopup(auth, provider);
        }   catch (error) {
        console.error(error);
        }
    };

    return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
    <h1>NEU Library System</h1>

    <button onClick={login}>
        Sign in with Google
    </button>
    </div>
);
}

export default Login;