<?php

declare(strict_types=1);

/*
 * ============================================================
 * CONTACT FORM EMAIL HANDLER
 * ============================================================
 *
 * REQUIREMENTS:
 *   - PHP 8.x recommended
 *   - PDO SQLite extension
 *   - PHPMailer
 *
 * FEATURES:
 *   - Sends email using Gmail SMTP
 *   - Visitor email becomes Reply-To
 *   - Maximum 3 successful messages per sender email / 24h
 *   - 4th message onward requires:
 *         VIP_permission4
 *         VIP_permission5
 *         VIP_permission6
 *         etc.
 *   - Maximum 15 successful website messages / 3h globally
 *   - Block specific sender addresses
 *   - Honeypot anti-bot field
 *   - JSON responses for JavaScript
 *
 * IMPORTANT:
 *   DO NOT put your Gmail password or app password in HTML/JS.
 *   This file stays server-side.
 * ============================================================
 */


/* ============================================================
   1. RESPONSE HEADERS
   ============================================================ */

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');


/* ============================================================
   2. PHPMailer LOADING
   ------------------------------------------------------------
   Composer is recommended.

   Preferred:
       composer require phpmailer/phpmailer

   This code also supports manually uploading PHPMailer to:
       /PHPMailer/src/
   ============================================================ */

$composerAutoload = __DIR__ . '/vendor/autoload.php';

if (is_file($composerAutoload)) {

    require $composerAutoload;

} else {

    /*
     * Manual PHPMailer fallback.
     *
     * Expected structure:
     *
     * /your-website/
     *     send-email.php
     *     PHPMailer/
     *         src/
     *             Exception.php
     *             PHPMailer.php
     *             SMTP.php
     */

    require __DIR__ . '/PHPMailer/src/Exception.php';
    require __DIR__ . '/PHPMailer/src/PHPMailer.php';
    require __DIR__ . '/PHPMailer/src/SMTP.php';
}


use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;


/* ============================================================
   3. BASIC CONFIGURATION
   ============================================================ */

const DESTINATION_EMAIL = 'syedabukhalid.pro@gmail.com';


/*
 * This is the Gmail account that your website will authenticate
 * with to send the message.
 *
 * Ideally this should be the SAME account as the destination:
 *
 * syedabukhalid.pro@gmail.com
 */
const SMTP_USERNAME = 'syedabukhalid.pro@gmail.com';


/*
 * IMPORTANT:
 *
 * DO NOT put your normal Gmail password here.
 *
 * Use a Gmail App Password if your account permits it.
 *
 * Replace this placeholder with your actual app password.
 */
const SMTP_PASSWORD = 'PUT_YOUR_GMAIL_APP_PASSWORD_HERE';


/*
 * Name that will appear as the sender.
 */
const FROM_NAME = 'Syed Abu Khalid Website';


/* ============================================================
   4. RATE LIMITS
   ============================================================ */

/*
 * Maximum number of successful messages from one normalized
 * email address during any rolling 24-hour period.
 */
const MAX_PER_SENDER_24H = 3;


/*
 * Maximum number of successful messages from ALL senders
 * during any rolling 3-hour period.
 */
const MAX_GLOBAL_3H = 15;


/* ============================================================
   5. BLOCKED EMAIL ADDRESSES
   ------------------------------------------------------------
   Matching is case-insensitive because emails are normalized
   to lowercase before this list is checked.
   ============================================================ */

$blockedSenders = [

    'xyz@gmail.com' =>
        'Abu Khalid has blocked your messages due to a disagreement regarding xyz, so you will not be able to contact him.',

    'abc@gmail.com' =>
        'Abu Khalid has blocked because he dont want to talk to u abc, so you will not be able to contact him.',

    'def@gmail.com' =>
        'Abu Khalid is bussy so he blocked you',

    'ghi@gmail.com' =>
        'i blocked your massages as you did disrespect to me...',

];


/* ============================================================
   6. HELPER: JSON RESPONSE
   ============================================================ */

function respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


/* ============================================================
   7. HELPER: NORMALIZE EMAIL
   ============================================================ */

function normalizeEmail(string $email): string
{
    return strtolower(trim($email));
}


/* ============================================================
   8. HELPER: SAFE STRING LENGTH
   ============================================================ */

function stringLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}


/* ============================================================
   9. ONLY ALLOW POST REQUESTS
   ============================================================ */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Invalid request method.'
        ],
        405
    );
}


/* ============================================================
   10. READ FORM DATA
   ============================================================ */

$name = trim((string)($_POST['name'] ?? ''));

$phone = trim((string)($_POST['phone'] ?? ''));

$email = normalizeEmail(
    (string)($_POST['email'] ?? '')
);

$subject = trim(
    (string)($_POST['subject'] ?? '')
);

$message = trim(
    (string)($_POST['message'] ?? '')
);

$honeypot = trim(
    (string)($_POST['website'] ?? '')
);

$permissionCode = trim(
    (string)($_POST['permission_code'] ?? '')
);


/* ============================================================
   11. HONEYPOT BOT CHECK
   ------------------------------------------------------------
   Normal users never interact with this field.

   If a bot fills it, pretend the request succeeded but don't
   actually send an email.
   ============================================================ */

if ($honeypot !== '') {

    respond(
        [
            'ok' => true,
            'status' => 'success',
            'message' => 'Your message has been sent successfully.'
        ]
    );
}


/* ============================================================
   12. BASIC VALIDATION
   ============================================================ */

if ($name === '' || stringLength($name) > 100) {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Please enter a valid name.'
        ],
        422
    );
}


if ($phone !== '' && stringLength($phone) > 40) {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Please enter a valid phone number.'
        ],
        422
    );
}


if (
    $email === '' ||
    stringLength($email) > 254 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Please enter a valid email address.'
        ],
        422
    );
}


if ($subject === '' || stringLength($subject) > 150) {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Please enter a valid subject.'
        ],
        422
    );
}


if ($message === '' || stringLength($message) > 5000) {

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' => 'Please enter a valid message.'
        ],
        422
    );
}


/* ============================================================
   13. CHECK BLOCKED EMAIL ADDRESS
   ============================================================ */

if (isset($blockedSenders[$email])) {

    respond(
        [
            'ok' => false,
            'status' => 'blocked',
            'message' => $blockedSenders[$email]
        ],
        403
    );
}


/* ============================================================
   14. DATABASE LOCATION
   ------------------------------------------------------------
   This tries to place the SQLite database OUTSIDE the public
   website directory.

   Example:
       /home/account/public_html/send-email.php

   database becomes:
       /home/account/private/contact-form.sqlite
   ============================================================ */

$privateDirectory = dirname(__DIR__) . '/private';

if (!is_dir($privateDirectory)) {

    if (!mkdir($privateDirectory, 0750, true)) {

        respond(
            [
                'ok' => false,
                'status' => 'error',
                'message' => 'The contact system is not configured correctly.'
            ],
            500
        );
    }
}


$databaseFile = $privateDirectory . '/contact-form.sqlite';


/* ============================================================
   15. OPEN SQLITE DATABASE
   ============================================================ */

try {

    $pdo = new PDO(
        'sqlite:' . $databaseFile,
        null,
        null,
        [
            PDO::ATTR_ERRMODE =>
                PDO::ERRMODE_EXCEPTION,

            PDO::ATTR_DEFAULT_FETCH_MODE =>
                PDO::FETCH_ASSOC,

            PDO::ATTR_EMULATE_PREPARES =>
                false,
        ]
    );

    /*
     * Wait briefly if another request is accessing the database.
     */
    $pdo->exec('PRAGMA busy_timeout = 5000');

    /*
     * WAL improves SQLite behavior with multiple requests.
     */
    $pdo->exec('PRAGMA journal_mode = WAL');


} catch (Throwable $exception) {

    error_log(
        'Contact form database error: ' .
        $exception->getMessage()
    );

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' =>
                'We could not process your message right now. Please try again later.'
        ],
        500
    );
}


/* ============================================================
   16. CREATE DATABASE TABLE
   ============================================================ */

try {

    $pdo->exec(
        '
        CREATE TABLE IF NOT EXISTS contact_messages (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            sender_email TEXT NOT NULL,

            sent_at INTEGER NOT NULL,

            ip_address TEXT

        )
        '
    );

    /*
     * Indexes make the rate-limit queries much faster.
     */
    $pdo->exec(
        '
        CREATE INDEX IF NOT EXISTS
        idx_contact_sender_time
        ON contact_messages(sender_email, sent_at)
        '
    );

    $pdo->exec(
        '
        CREATE INDEX IF NOT EXISTS
        idx_contact_time
        ON contact_messages(sent_at)
        '
    );

} catch (Throwable $exception) {

    error_log(
        'Contact form table error: ' .
        $exception->getMessage()
    );

    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' =>
                'We could not process your message right now.'
        ],
        500
    );
}


/* ============================================================
   17. CURRENT TIME / IP
   ============================================================ */

$now = time();

/*
 * We intentionally use REMOTE_ADDR instead of blindly trusting
 * X-Forwarded-For because client-controlled headers can be spoofed.
 */
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';


/* ============================================================
   18. TRANSACTION
   ------------------------------------------------------------
   The transaction prevents two simultaneous requests from
   bypassing the 3-message limit through a race condition.
   ============================================================ */

try {

    $pdo->beginTransaction();


    /* --------------------------------------------------------
       18A. CLEAN OLD RECORDS
       --------------------------------------------------------
       Keep only enough history to enforce the 24-hour limit.
       -------------------------------------------------------- */

    $cleanupCutoff = $now - (48 * 60 * 60);

    $cleanupStatement = $pdo->prepare(
        '
        DELETE FROM contact_messages
        WHERE sent_at < :cutoff
        '
    );

    $cleanupStatement->execute(
        [
            ':cutoff' => $cleanupCutoff
        ]
    );


    /* --------------------------------------------------------
       18B. GLOBAL 3-HOUR LIMIT
       -------------------------------------------------------- */

    $globalCutoff = $now - (3 * 60 * 60);

    $globalStatement = $pdo->prepare(
        '
        SELECT COUNT(*)
        FROM contact_messages
        WHERE sent_at >= :cutoff
        '
    );

    $globalStatement->execute(
        [
            ':cutoff' => $globalCutoff
        ]
    );

    $globalCount = (int)$globalStatement->fetchColumn();


    /*
     * Once 15 successful messages have been sent during the
     * previous 3 hours, no additional message is sent.
     */

    if ($globalCount >= MAX_GLOBAL_3H) {

        $pdo->rollBack();

        respond(
            [
                'ok' => false,
                'status' => 'high_traffic',
                'message' =>
                    'Oops! We are receiving a high number of messages right now. Please try contacting us again a bit later.'
            ],
            429
        );
    }


    /* --------------------------------------------------------
       18C. PER-SENDER 24-HOUR LIMIT
       -------------------------------------------------------- */

    $senderCutoff = $now - (24 * 60 * 60);

    $senderStatement = $pdo->prepare(
        '
        SELECT COUNT(*)
        FROM contact_messages
        WHERE sender_email = :email
          AND sent_at >= :cutoff
        '
    );

    $senderStatement->execute(
        [
            ':email' => $email,
            ':cutoff' => $senderCutoff
        ]
    );

    $senderCount = (int)$senderStatement->fetchColumn();


    /* --------------------------------------------------------
       18D. PERMISSION CODE CHECK
       --------------------------------------------------------
       First 3 messages:
           No code required.

       4th:
           VIP_permission4

       5th:
           VIP_permission5

       6th:
           VIP_permission6

       etc.
       -------------------------------------------------------- */

    if ($senderCount >= MAX_PER_SENDER_24H) {

        $nextNumber = $senderCount + 1;

        $expectedPermissionCode =
            'VIP_permission' . $nextNumber;


        /*
         * No permission code supplied.
         * Tell JavaScript to open the permission popup.
         */

        if ($permissionCode === '') {

            $pdo->rollBack();

            respond(
                [
                    'ok' => false,
                    'status' => 'permission_required',
                    'count' => $senderCount,
                    'nextNumber' => $nextNumber,
                    'message' =>
                        "You've successfully sent {$senderCount} emails! To send a " .
                        ordinalSuffix($nextNumber) .
                        " email from this portal, please enter your permission code to proceed."
                ],
                403
            );
        }


        /*
         * Compare the provided code to the server-side code.
         *
         * hash_equals() avoids a simple timing comparison.
         */

        if (!hash_equals($expectedPermissionCode, $permissionCode)) {

            $pdo->rollBack();

            respond(
                [
                    'ok' => false,
                    'status' => 'invalid_permission',
                    'message' =>
                        'The permission code is incorrect. Please enter the correct code to continue.'
                ],
                403
            );
        }
    }


    /* ========================================================
       19. BUILD AND SEND EMAIL
       ======================================================== */

    $mail = new PHPMailer(true);

    /*
     * SMTP settings
     */
    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = SMTP_USERNAME;

    $mail->Password = SMTP_PASSWORD;

    /*
     * Gmail SMTP over implicit TLS.
     */
    $mail->SMTPSecure =
        PHPMailer::ENCRYPTION_SMTPS;

    $mail->Port = 465;

    /*
     * Never display SMTP debugging information to users.
     */
    $mail->SMTPDebug = 0;

    /*
     * Avoid keeping a web request hanging forever.
     */
    $mail->Timeout = 15;

    $mail->CharSet = 'UTF-8';


    /* --------------------------------------------------------
       FROM
       --------------------------------------------------------
       Must be your authenticated email/account.
       Do NOT use the visitor's address here.
       -------------------------------------------------------- */

    $mail->setFrom(
        SMTP_USERNAME,
        FROM_NAME
    );


    /* --------------------------------------------------------
       TO
       -------------------------------------------------------- */

    $mail->addAddress(
        DESTINATION_EMAIL,
        'Syed Abu Khalid'
    );


    /* --------------------------------------------------------
       REPLY-TO
       --------------------------------------------------------
       When you press Reply in Gmail, the reply will go to the
       visitor who submitted the form.
       -------------------------------------------------------- */

    $mail->addReplyTo(
        $email,
        $name
    );


    /* --------------------------------------------------------
       SAFE HTML VALUES
       -------------------------------------------------------- */

    $safeName =
        htmlspecialchars(
            $name,
            ENT_QUOTES |
            ENT_SUBSTITUTE,
            'UTF-8'
        );

    $safeEmail =
        htmlspecialchars(
            $email,
            ENT_QUOTES |
            ENT_SUBSTITUTE,
            'UTF-8'
        );

    $safePhone =
        htmlspecialchars(
            $phone !== '' ? $phone : 'Not provided',
            ENT_QUOTES |
            ENT_SUBSTITUTE,
            'UTF-8'
        );

    $safeSubject =
        htmlspecialchars(
            $subject,
            ENT_QUOTES |
            ENT_SUBSTITUTE,
            'UTF-8'
        );

    $safeMessage =
        nl2br(
            htmlspecialchars(
                $message,
                ENT_QUOTES |
                ENT_SUBSTITUTE,
                'UTF-8'
            )
        );


    /* --------------------------------------------------------
       EMAIL SUBJECT
       -------------------------------------------------------- */

    $mail->Subject =
        '[Website Contact] ' . $subject;


    /* --------------------------------------------------------
       HTML EMAIL BODY
       -------------------------------------------------------- */

    $mail->isHTML(true);

    $mail->Body =

        '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Website Contact Message</title>
        </head>

        <body style="font-family: Arial, sans-serif; line-height: 1.6;">

            <h2>New Contact Form Message</h2>

            <p>
                <strong>Name:</strong>
                ' . $safeName . '
            </p>

            <p>
                <strong>Email:</strong>
                ' . $safeEmail . '
            </p>

            <p>
                <strong>Phone:</strong>
                ' . $safePhone . '
            </p>

            <p>
                <strong>Subject:</strong>
                ' . $safeSubject . '
            </p>

            <hr>

            <p>
                <strong>Message:</strong>
            </p>

            <div>
                ' . $safeMessage . '
            </div>

        </body>
        </html>';


    /* --------------------------------------------------------
       PLAIN-TEXT ALTERNATIVE
       -------------------------------------------------------- */

    $mail->AltBody =
        "New Contact Form Message\n\n" .
        "Name: " . $name . "\n" .
        "Email: " . $email . "\n" .
        "Phone: " . ($phone !== '' ? $phone : 'Not provided') . "\n" .
        "Subject: " . $subject . "\n\n" .
        "Message:\n" .
        $message . "\n\n" .
        "IP Address: " . $clientIp . "\n" .
        "Time: " . date('Y-m-d H:i:s') . "\n";


    /* --------------------------------------------------------
       SEND
       -------------------------------------------------------- */

    $mail->send();


    /* ========================================================
       20. ONLY COUNT THE MESSAGE AFTER SUCCESSFUL SEND
       ======================================================== */

    $insertStatement = $pdo->prepare(
        '
        INSERT INTO contact_messages
        (
            sender_email,
            sent_at,
            ip_address
        )
        VALUES
        (
            :email,
            :sent_at,
            :ip
        )
        '
    );

    $insertStatement->execute(
        [
            ':email' => $email,
            ':sent_at' => $now,
            ':ip' => $clientIp
        ]
    );


    /* ========================================================
       21. COMMIT EVERYTHING
       ======================================================== */

    $pdo->commit();


    /* ========================================================
       22. SUCCESS RESPONSE
       ======================================================== */

    respond(
        [
            'ok' => true,
            'status' => 'success',
            'message' =>
                'Your message has been sent successfully. Thank you for contacting me.'
        ]
    );


} catch (Throwable $exception) {

    /*
     * If anything went wrong, don't count the message.
     */

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }


    /*
     * Log the real technical error server-side.
     * Do NOT expose it to visitors.
     */

    error_log(
        'Contact form send error: ' .
        $exception->getMessage()
    );


    respond(
        [
            'ok' => false,
            'status' => 'error',
            'message' =>
                'We could not send your message right now. Please try again later.'
        ],
        500
    );
}


/* ============================================================
   23. ORDINAL SUFFIX FUNCTION
   ============================================================ */

function ordinalSuffix(int $number): string
{
    $lastTwo = $number % 100;

    if ($lastTwo >= 11 && $lastTwo <= 13) {
        return $number . 'th';
    }

    switch ($number % 10) {

        case 1:
            return $number . 'st';

        case 2:
            return $number . 'nd';

        case 3:
            return $number . 'rd';

        default:
            return $number . 'th';
    }
}