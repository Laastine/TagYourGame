package org.fgj

import org.scalatra._
import scalate.ScalateSupport
import org.scalatra.atmosphere._
import org.scalatra.json.{JValueResult, JacksonJsonSupport}
import org.json4s._
import JsonDSL._
import java.util.Date

import scala.concurrent._
import ExecutionContext.Implicits.global

class ServerController extends ScalatraServlet
with ScalateSupport with JValueResult
with JacksonJsonSupport with SessionSupport
with AtmosphereSupport {

  implicit protected val jsonFormats: Formats = DefaultFormats

  get("/") {
    contentType = "text/html"
    ssp("/index")
  }

  atmosphere("/server") {
    new AtmosphereClient {
      def receive: AtmoReceive = {
        case Connected =>
          println("Player %s is connected" format uuid)
          broadcast(("author" -> "Someone") ~ ("message" -> "joined the game") ~ ("time" -> (new Date().getTime.toString)), Everyone)

        case Disconnected(ClientDisconnected, _) =>
          broadcast(("author" -> "Someone") ~ ("message" -> "has left the game") ~ ("time" -> (new Date().getTime.toString)), Everyone)

        case Disconnected(ServerDisconnected, _) =>
          println("Server disconnected the client %s" format uuid)
        case _: TextMessage =>
          send(("author" -> "system") ~ ("message" -> "Only json is allowed") ~ ("time" -> (new Date().getTime.toString)))

        case JsonMessage(json) =>
          println("Got message %s from %s".format((json \ "message").extract[String], (json \ "author").extract[String]))
          val msg = json merge (("time" -> (new Date().getTime().toString)): JValue)
          broadcast(msg) // by default a broadcast is to everyone but self
          send(msg) // also send to the sender
      }
    }
  }

  error {
    case e: Throwable => e.printStackTrace()
  }

  notFound {
    contentType = null // remove content type in case it was set through an action
    findTemplate(requestPath) map {
      path => // Try to render a ScalateTemplate if no route matched
        contentType = "text/html"
        layoutTemplate(path)
    } orElse serveStaticResource() getOrElse resourceNotFound()
  }
}
