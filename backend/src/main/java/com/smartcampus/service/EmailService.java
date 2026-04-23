package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Ticket;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@smartcampus.com}")
    private String fromEmail;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMM dd, yyyy 'at' hh:mm a");

    @Async
    public void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmation: " + booking.getResourceName();
        String htmlContent = buildEmailTemplate(
                "Booking Confirmed",
                "Your booking has been successfully confirmed. Below are the details of your reservation:",
                booking,
                "#28a745" // Green color for success
        );
        sendHtmlEmail(booking.getUserEmail(), subject, htmlContent);
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        String subject = "Booking Cancelled: " + booking.getResourceName();
        String htmlContent = buildEmailTemplate(
                "Booking Cancelled",
                "Your booking has been cancelled. If this was a mistake, please make a new booking.",
                booking,
                "#dc3545" // Red color for cancellation
        );
        sendHtmlEmail(booking.getUserEmail(), subject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (to == null || to.isEmpty()) {
            log.warn("Cannot send email due to missing recipient address.");
            return;
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            javaMailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    private String buildEmailTemplate(String header, String message, Booking booking, String color) {
        String resourceName = booking.getResourceName() != null ? booking.getResourceName() : "Unknown Resource";
        String startTime = booking.getStartTime() != null ? booking.getStartTime().format(dateFormatter) : "N/A";
        String endTime = booking.getEndTime() != null ? booking.getEndTime().format(dateFormatter) : "N/A";
        String purpose = booking.getPurpose() != null ? booking.getPurpose() : "N/A";
        String attendees = booking.getExpectedAttendees() != null ? String.valueOf(booking.getExpectedAttendees()) : "N/A";
        String status = booking.getStatus() != null ? booking.getStatus() : "N/A";

        return "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
                ".header { background-color: " + color + "; color: white; padding: 20px; text-align: center; }" +
                ".header h2 { margin: 0; font-size: 24px; }" +
                ".content { padding: 30px; line-height: 1.6; }" +
                ".content p { margin-bottom: 20px; }" +
                ".details { background-color: #f1f3f5; padding: 15px; border-radius: 6px; margin-bottom: 20px; }" +
                ".details table { width: 100%; border-collapse: collapse; }" +
                ".details td { padding: 8px 0; border-bottom: 1px solid #e9ecef; }" +
                ".details td:first-child { font-weight: bold; width: 40%; color: #495057; }" +
                ".details td:last-child { color: #212529; text-align: right; }" +
                ".footer { background-color: #343a40; color: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h2>" + header + "</h2></div>" +
                "<div class='content'>" +
                "<p>Hello " + booking.getUserName() + ",</p>" +
                "<p>" + message + "</p>" +
                "<div class='details'>" +
                "<table>" +
                "<tr><td>Facility:</td><td>" + resourceName + "</td></tr>" +
                "<tr><td>Start Time:</td><td>" + startTime + "</td></tr>" +
                "<tr><td>End Time:</td><td>" + endTime + "</td></tr>" +
                "<tr><td>Purpose:</td><td>" + purpose + "</td></tr>" +
                "<tr><td>Attendees:</td><td>" + attendees + "</td></tr>" +
                "<tr><td>Status:</td><td>" + status + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<p>Thank you for using our Smart Campus Booking System!</p>" +
                "</div>" +
                "<div class='footer'>This is an automated message. Please do not reply to this email.</div>" +
                "</div></body></html>";
    }

    @Async
    public void sendTicketCreation(Ticket ticket) {
        String subject = "Support Ticket Created: " + ticket.getSubject();
        String htmlContent = buildTicketEmailTemplate(
                "Ticket Created",
                "Your support ticket has been successfully created. Our team will review it shortly. Details are below:",
                ticket,
                "#17a2b8" // Info Blue color
        );
        sendHtmlEmail(ticket.getUserEmail(), subject, htmlContent);
    }

    @Async
    public void sendTicketStatusUpdate(Ticket ticket) {
        String subject = "Ticket Status Updated: " + ticket.getSubject();
        String color = "#007bff";
        if ("RESOLVED".equalsIgnoreCase(ticket.getStatus()) || "CLOSED".equalsIgnoreCase(ticket.getStatus())) {
            color = "#28a745"; // Green
        } else if ("IN_PROGRESS".equalsIgnoreCase(ticket.getStatus())) {
            color = "#ffc107"; // Yellow
        }
        String htmlContent = buildTicketEmailTemplate(
                "Ticket Update",
                "There has been an update to your support ticket. Please check the current status below:",
                ticket,
                color
        );
        sendHtmlEmail(ticket.getUserEmail(), subject, htmlContent);
    }

    private String buildTicketEmailTemplate(String header, String message, Ticket ticket, String color) {
        String subject = ticket.getSubject() != null ? ticket.getSubject() : "N/A";
        String category = ticket.getCategory() != null ? ticket.getCategory() : "N/A";
        String priority = ticket.getPriority() != null ? ticket.getPriority() : "N/A";
        String status = ticket.getStatus() != null ? ticket.getStatus() : "N/A";

        return "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
                ".header { background-color: " + color + "; color: white; padding: 20px; text-align: center; }" +
                ".header h2 { margin: 0; font-size: 24px; }" +
                ".content { padding: 30px; line-height: 1.6; }" +
                ".content p { margin-bottom: 20px; }" +
                ".details { background-color: #f1f3f5; padding: 15px; border-radius: 6px; margin-bottom: 20px; }" +
                ".details table { width: 100%; border-collapse: collapse; }" +
                ".details td { padding: 8px 0; border-bottom: 1px solid #e9ecef; }" +
                ".details td:first-child { font-weight: bold; width: 40%; color: #495057; }" +
                ".details td:last-child { color: #212529; text-align: right; }" +
                ".footer { background-color: #343a40; color: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h2>" + header + "</h2></div>" +
                "<div class='content'>" +
                "<p>Hello " + ticket.getUserName() + ",</p>" +
                "<p>" + message + "</p>" +
                "<div class='details'>" +
                "<table>" +
                "<tr><td>Subject:</td><td>" + subject + "</td></tr>" +
                "<tr><td>Category:</td><td>" + category + "</td></tr>" +
                "<tr><td>Priority:</td><td>" + priority + "</td></tr>" +
                "<tr><td>Status:</td><td>" + status + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<p>Thank you for using our Smart Campus Support System!</p>" +
                "</div>" +
                "<div class='footer'>This is an automated message. Please do not reply to this email.</div>" +
                "</div></body></html>";
    }
}
