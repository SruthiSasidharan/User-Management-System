# User-Management-System
User Management System with Django REST Framework (backend) and a
simple JavaScript frontend. 

# Features
1. Authentication
   User Registration (username, email, password).
   Login & Logout using JWT token authentication.

2. Profile Management
Each user has a profile with:
   ○ Full name
   ○ Date of birth
   ○ Email
   ○ Address
   ○ Gender
   ○ Mobile Number

Users should be able to:
   ○ View their profile
   ○ Update their profile
   ○ Reset Password

3. CRUD Module
fields:
○ Title (String)
○ Description (Text)
○ Created_at (Auto Generated)
○ Modified_at (Auto Generated)
○ Attachment (File Field)

Operations:
Create
List
Update
Delete

4. Technologies Used:
Django 4.2.27
Django REST Framework 3.15.2
djangorestframework-simplejwt 5.3.1
MySQL
HTML
Javascript
CSS

## Installation
Create Virtual Environment 

    python -m venv venv

Activate Venv

    venv\Scripts\activate

Install requirements

    pip install requirements.txt

create superuser

        python manage.py createsuperuser

Run server

    python manage.py runserver


Server Ports:

    Frontend: http://127.0.0.1:8000/
    API Base: http://127.0.0.1:8000/api/
    Admin Panel: http://127.0.0.1:8000/admin/