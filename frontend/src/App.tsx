import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {RegisterForm} from './pages/RegisterForm';
import {LogoutTest} from './pages/LogoutTest';
import {LoginFormTest} from './pages/LoginFormTest';
import {DashBoard} from './pages/DashBoard';
import {UserData} from './pages/UserData';
import {User} from './pages/User';
import {ProfileEdit} from './pages/ProfileEdit';
import {CrowdfundingProjectForm} from './pages/CrowdfundingProjectForm';
import {ProjectDetail} from './pages/ProjectDetail';
import {CrowdfundingProjectList} from './pages/CrowdfundingProjectList';
import {VerifyEmail} from './pages/VerifyEmail';
import { SupportSuccess } from "./pages/SupportSuccess";
import { IdentityVerificationForm } from './pages/IdentityVerificationForm';
import { AdminIdentityVerificationList } from './pages/AdminIdentityVerificationLis';
import { MyProjects } from './pages/MyProjects';
import { AdminProjectReview } from './pages/AdminProjectReview';
import { AdminPayoutRecords } from './pages/AdminPayoutRecords';


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CrowdfundingProjectList/>} />
        <Route path="/crowdfunding/:id" element={<ProjectDetail />} />
        <Route path="/register" element={<RegisterForm/>} />
        <Route path="/dashboard" element={<VerifyEmail />} />
        <Route path="/email/verify/:id/:hash" element={<VerifyEmail />} />
        <Route path="/login" element={<LoginFormTest/>} />
        <Route path="/logout" element={<LogoutTest/>} />
        <Route path="/users" element={<User/>} />
        <Route path="/post" element={<CrowdfundingProjectForm/>} />
        <Route path="/edit" element={<ProfileEdit/>} />
        <Route path="/admin/verify" element={< AdminIdentityVerificationList/>} />
        <Route path="/admin/pay" element={< AdminPayoutRecords/>} />
        <Route path="/admin/dashboard" element={<DashBoard/>} />
        <Route path="/admin/users" element={<UserData/>} />
        <Route path="/admin/review" element={<AdminProjectReview/>} />
        <Route path="/success" element={<SupportSuccess/>} />
        <Route path="/verify" element={<IdentityVerificationForm />} />
        <Route path="/myprojects" element={<MyProjects />} />
        </Routes>
    </BrowserRouter>
  );
}


