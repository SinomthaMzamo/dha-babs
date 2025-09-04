# DHA Online Booking System

A modern, user-friendly online booking system for South Africa's Department of Home Affairs (DHA) services.

## Features

### 🔐 Step 1: Authentication
- ID Type selection (ID Number or Passport Number)
- 13-digit ID number validation with Luhn algorithm
- Real-time validation feedback
- Secure data storage

### 👤 Step 2: Personal Information
- Forenames and Last Name collection
- Email and Phone number validation
- ID number confirmation
- Data persistence between steps

### 📅 Step 3: Service Booking
- Multiple service selection (Smart ID, Passport, Certificates, etc.)
- Hierarchical location selection (Province → Area → Branch)
- Date range selection for appointments
- Comprehensive form validation

## Technology Stack

- **Frontend**: Angular 19 with standalone components
- **Styling**: CSS with modern design principles
- **State Management**: RxJS BehaviorSubjects
- **Validation**: Reactive forms with custom validators
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI (v19)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dha-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── authenticate/          # Step 1: ID authentication
│   │   ├── personal-info/         # Step 2: Personal details
│   │   ├── book-service/          # Step 3: Service booking
│   │   └── progress-indicator/    # Progress tracking
│   ├── services/
│   │   └── booking.service.ts     # Data management & validation
│   ├── app.component.ts           # Main app component
│   ├── app.routes.ts              # Routing configuration
│   └── app.config.ts              # App configuration
├── index.html                     # Main HTML file
└── styles.css                     # Global styles
```

## Key Features

### Form Validation
- Real-time validation feedback
- Custom validators for South African ID numbers
- Phone number format validation (SA format)
- Email format validation
- Required field validation

### User Experience
- Progress indicator showing current step
- Responsive design for all devices
- Clear error messages and validation feedback
- Smooth navigation between steps
- Data persistence across steps

### Security
- Client-side validation
- Session storage for temporary data
- No sensitive data logging
- Form data sanitization

## Validation Rules

### ID Number
- Must be exactly 13 digits
- Must pass Luhn algorithm validation
- Only numeric characters allowed

### Phone Number
- Must start with +27 or 0
- Must be 10-11 digits total
- Must start with 6, 7, or 8 after country code

### Email
- Standard email format validation
- Required field

## Future Enhancements

- [ ] Backend API integration
- [ ] User authentication and accounts
- [ ] Appointment confirmation emails
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Advanced date/time slot selection
- [ ] Payment integration
- [ ] Document upload functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
