import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AnimalDetailsPage } from '../pages/AnimalDetailsPage'
import { AnimalsPage } from '../pages/AnimalsPage'
import { CreateAnimalPage } from '../pages/CreateAnimalPage'
import { EditAnimalPage } from '../pages/EditAnimalPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyAnimalsPage } from '../pages/MyAnimalsPage'
import { MyAdoptionRequestsPage } from '../pages/MyAdoptionRequestsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ReceivedAdoptionRequestsPage } from '../pages/ReceivedAdoptionRequestsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="animals" element={<AnimalsPage />} />
        <Route path="animals/:id" element={<AnimalDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="animals/new" element={<CreateAnimalPage />} />
          <Route path="animals/:id/edit" element={<EditAnimalPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-animals" element={<MyAnimalsPage />} />
          <Route path="my-adoption-requests" element={<MyAdoptionRequestsPage />} />
          <Route
            path="received-adoption-requests"
            element={<ReceivedAdoptionRequestsPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
