import { useState } from 'react'
import { UserManagementConsole } from './components/UserManagementConsole'
import { UserProvisioningForm } from './components/UserProvisioningForm'

function App() {
  const [showProvisioning, setShowProvisioning] = useState(false);

  return (
    <>
      <UserManagementConsole onProvisionClick={() => setShowProvisioning(true)} />
      {showProvisioning && (
        <UserProvisioningForm onClose={() => setShowProvisioning(false)} />
      )}
    </>
  )
}

export default App
