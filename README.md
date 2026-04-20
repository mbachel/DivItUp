# DivItUp

> **Split bills. Not friendships.**

**[Live App → divitup.org](https://divitup.org)**

DivItUp is a household management web application designed to help roommates, college students, and any group of travellers coordinate shared expenses and chores all in one place. 
The problem we address is very common in a co-living situation: keeping track of who owes what, who paid for groceries, and whose turn it is to clean or do other chores can quickly lead to confusion and conflict.
We bring it all together in a single application, allowing roommates to log and split expenses, assign chores, and view a summary of all members’ contributions.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **TypeScript** | Type-safe application logic |
| **React / Next.js** | Component-based UI with server-side rendering |
| **Nginx** | Production web server with SSL/HTTPS support |

### Backend
| Technology | Purpose |
|---|---|
| **Python** | Core backend language |
| **FastAPI** | High-performance REST API framework |
| **SQLAlchemy** | ORM for database interaction |
| **PyMySQL** | MySQL database driver |
| **JWT (JSON Web Tokens)** | Secure user authentication |
| **Mindee API** | AI-powered receipt OCR and data extraction |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| **MySQL 9.6** | Relational database for persistent storage |
| **Docker & Docker Compose** | Containerized, one-command deployment |

---

## Contributors

### Matthew Bachelder — DevOps Engineer
**[@mbachel](https://github.com/mbachel)**

Matthew owned all things infrastructure — setting up and managing the Docker Compose environment, configuring the Nginx server with SSL/HTTPS support, and ensuring the application could be reliably deployed end to end.

---

### Agam Bajaj — Frontend Developer
**[@AgsBajs](https://github.com/AgsBajs)**

Agam designed and built the user-facing side of DivItUp — crafting the pages, components, and flows that users interact with, from receipt upload to expense tracking and group management.

---

### Jessica — Backend Developer

Jessica built the server-side logic that powers DivItUp — designing and implementing the FastAPI REST endpoints, integrating the Mindee AI receipt scanning API, and handling JWT-based authentication and session management.

---

### Soumil Kothari — Database Engineer
**[@kotharisoumil](https://github.com/kotharisoumil)**

Soumil designed and managed the MySQL database layer — modeling the schema, writing the database seeding scripts, and ensuring data integrity across users, groups, receipts, and expenses.

---
