<!DOCTYPE html>
<html lang="uk">
<head>  
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Website</title>
    <link rel="icon" href="../icons/icon-192.png" type="image/png">
    <link rel="manifest" href="./manifest.json">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="students.css">
    
</head>
<body>
    <?php require_once 'options.php'; ?>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <button class="btn btn-dark d-lg-none me-3" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand" href="#">CMS</a>
            <div class="dropdown notification-wrapper ms-auto me-3 position-relative">
                <a class="nav-link" href="messages.php" role="button">
                    <i class="bi bi-bell bell-icon"></i>
                    <span class="notification-dot"></span>
                </a>
                <ul class="dropdown-menu notification-dropdown dropdown-menu-end">
                    <div class="notification-item unread">
                        <div class="profile-icon-container">
                            <img src="../icons/profile-icon.svg" alt="User Icon" class="profile-icon">
                            <p class="username"><em>John D.</em></p>
                        </div>
                        <div class="notification-content">
                            <p class="message">Liked a message you sent</p>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="profile-icon-container">
                            <img src="../icons/profile-icon.svg" alt="User Icon" class="profile-icon">
                            <p class="username"><em>Vitalii K.</em></p>
                        </div>
                        <div class="notification-content">
                            <p class="message">Sent you a videomessage</p>
                        </div>
                    </div>
                </ul>
            </div>
            <div class="profile-wrapper d-flex align-items-center">
                <div class="dropdown">
                    <a class="nav-link profile-link text-white" href="#" role="button" data-bs-toggle="dropdown">
                        <img src="../icons/profile-icon.svg" alt="Профіль" class="rounded-circle me-2" width="30"> Johny Sins
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#">Profile</a></li>
                        <li><a class="dropdown-item" href="#">Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    <div class="offcanvas offcanvas-start text-bg-dark" id="sidebarMenu">
        <div class="offcanvas-header">
            <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body"></div>
    </div>
    <div class="container-fluid mt-5 pt-4">
        <div class="row">
            <nav class="col-md-2 d-none d-md-block sidebar p-3">
                <ul class="nav flex-column sidebar-nav">
                    <li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link active-btn" href="students.php">Students</a></li>
                    <li class="nav-item"><a class="nav-link" href="tasks.html">Tasks</a></li>
                </ul>
            </nav>
            <main class="col-md-10 ms-sm-auto px-md-4">
                <h2 class="mt-4">Students</h2>
                <div class="modal fade" id="studentModal" tabindex="-1" aria-labelledby="studentModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="studentModalLabel">Add/Edit student</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="studentForm">
                                    <input type="hidden" id="studentId">
                                    <div class="mb-3 row">
                                        <label for="group" class="col-sm-4 col-form-label">Group</label>
                                        <div class="col-sm-8">
                                            <select class="form-select" id="group" required>
                                                <option value="">Select group</option>
                                                <?php foreach ($groups as $id => $name): ?>
                                                    <option value="<?= $id; ?>"><?= htmlspecialchars($name); ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="firstName" class="col-sm-4 col-form-label">First name</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="firstName" required>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="lastName" class="col-sm-4 col-form-label">Last name</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="lastName" required>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="gender" class="col-sm-4 col-form-label">Gender</label>
                                        <div class="col-sm-8">
                                            <select class="form-select" id="gender" required>
                                                <option value="">Select Gender</option>
                                                <?php foreach ($genders as $id => $name): ?>
                                                    <option value="<?= $id; ?>"><?= htmlspecialchars($name); ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="birthday" class="col-sm-4 col-form-label">Birthday</label>
                                        <div class="col-sm-8">
                                            <input type="date" class="form-control" id="birthday" required>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="status" class="col-sm-4 col-form-label">Status</label>
                                        <div class="col-sm-8">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="status">
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveStudent">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="deleteConfirmModalLabel">Warning</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure want to delete user <span class="student-name"></span>?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-danger" id="confirmDelete">Ok</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="table-wrapper position-relative">
                    <button class="btn btn-outline-primary add-edit-btn form-opener" data-id="0">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <div class="table-responsive">
                        <table class="table table-bordered" id="list-students">
                            <thead class="table-dark">
                                <tr>
                                    <td><input type="checkbox" id="selectAll"></td>
                                    <th>Group</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Birthday</th>
                                    <th>Status</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($students as $student): ?>
                                    <tr data-id="<?= $student['id']; ?>"
                                        data-group-id="<?= $student['group_id']; ?>"
                                        data-first-name="<?= htmlspecialchars($student['first_name']); ?>"
                                        data-last-name="<?= htmlspecialchars($student['last_name']); ?>"
                                        data-gender-id="<?= $student['gender_id']; ?>"
                                        data-birthday="<?= $student['birthday']; ?>"
                                        data-status="<?= $student['status'] ? 'true' : 'false'; ?>">
                                        <td><input type="checkbox"></td>
                                        <td><b><?= htmlspecialchars($groups[ $student['group_id']]); ?></b></td>
                                        <td><b><?= htmlspecialchars($student['first_name'] . ' ' . $student['last_name']); ?></b></td>
                                        <td><b><?= htmlspecialchars($genders[ $student['gender_id']]); ?></b></td>
                                        <td><b><?= date('d.m.Y', strtotime($student['birthday'])); ?></b></td>
                                        <td><span class="status <?= $student['status'] ? 'active' : ''; ?>"></span></td>
                                        <td class="align-middle">
                                            <button class="btn btn-sm btn-outline-primary add-edit-btn" data-id="<?= $student['id']; ?>">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-primary delete-btn" data-id="<?= $student['id']; ?>">
                                                <i class="bi bi-x-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <nav>
                    <ul class="pagination justify-content-center">
                        <li class="page-item disabled"><a class="page-link"><</a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item"><a class="page-link" href="#">4</a></li>
                        <li class="page-item"><a class="page-link" href="#">></a></li>
                    </ul>
                </nav>
            </main>
        </div>
    </div>
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .catch(err => console.log('Service Worker registration error: ', err));
            });
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="./student.js"></script>
</body>
</html>