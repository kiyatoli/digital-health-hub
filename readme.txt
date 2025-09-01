Test user credentials after running that endpoint:

Email: admin@digitalhealthhub.com / Password: test123
Email: dr.smith@digitalhealthhub.com / Password: test123
Email: pharmacist@digitalhealthhub.com / Password: test123
Email: lab@digitalhealthhub.com / Password: test123
          test@example.com, password: test123, 



          /frontend
├── public
│   └── index.html
├── src
│   ├── components
│   │   ├── Login.js
│   │   ├── Registration.js
│   │   ├── Dashboard.js  # Role-based
│   │   ├── AppointmentForm.js
│   │   ├── EMRView.js
│   │   ├── Telemedicine.js  # WebRTC integration
│   │   ├── Inventory.js
│   │   ├── Analytics.js  # With Chart.js
│   │   └── ... (one per feature)
│   ├── i18n
│   │   ├── en.json
│   │   ├── am.json  # Amharic
│   │   └── om.json  # Afan Oromo
│   ├── services
│   │   └── api.js  # Axios instance
│   ├── App.js
│   ├── index.js
│   └── theme.js  # Material-UI theme
├── .env
└── package.json


/backend
├── config
│   └── db.js  # PostgreSQL connection
├── controllers
│   ├── authController.js
│   ├── appointmentController.js
│   ├── emrController.js
│   ├── referralController.js
│   ├── inventoryController.js
│   ├── billingController.js
│   ├── analyticsController.js
│   └── userController.js
├── middleware
│   ├── auth.js  # JWT + RBAC
│   └── mfa.js   # MFA validation
├── models
│   ├── userModel.js
│   └── ... (one per table)
├── routes
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   └── ... (one per feature)
├── utils
│   └── emailSms.js  # For reminders (integrate Twilio/SendGrid)
├── .env
├── package.json
└── server.js

the new added feature is to use the hospital id or cinlic id value to determine which hospital or cinlic they work 


1:fix the usermangament for the not super admin but admin its not fully loading 
2: fix usermangemnt filter to filer based on the hospitals and cinlic names 
3: Make the analyis based on the new created admin and super admin roles using the value of the hospital id or cinlic ids
4: Add function in the usermangament for admin or super admin to assign the cinlics and  hospitals 
5: also fix the first name and last name input its  full name not full and last name 
it sould be inputed name fathername and last name in one label but have to be space bn the names 