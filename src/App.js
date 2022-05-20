import './App.css';
import { Amplify} from "aws-amplify"
import { withAuthenticator } from "@aws-amplify/ui-react"
import awsExports from "./aws-exports"
import '@aws-amplify/ui-react/styles.css';
import "maplibre-gl/dist/maplibre-gl.css"
import Home from './Home';
import Friends from './Friends';
import Users from './Users';
import { Routes, Route, Link } from "react-router-dom";

Amplify.configure(awsExports)

function App() {

  return (
    <div className='App'>
      <h1>Welcome to Enola</h1>
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
          <Link to ="/friends">Friends</Link>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/users" element={<Users />}/>
            <Route path="/friends" element={<Friends />}/>
          </Routes>
    </div>
  );
}

export default withAuthenticator(App);

