package org.fgj

import org.scalatra._
import scalate.ScalateSupport
import org.scalatra.atmosphere._
import org.scalatra.json.{JValueResult, JacksonJsonSupport}
import org.json4s._
import org.slf4j.LoggerFactory
import JsonDSL._
import java.util.Date

import scala.concurrent._
import ExecutionContext.Implicits.global

/**
 * server
 * Created with IntelliJ IDEA.
 * User: laastine
 * Date: 25.01.2014
 */
class ServerController extends ScalatraServlet
  with JValueResult with JacksonJsonSupport
  with SessionSupport with AtmosphereSupport {

  implicit protected val jsonFormats: Formats = DefaultFormats
  def logger = LoggerFactory.getLogger(this.getClass)

  atmosphere("/hipserver") {
    new AtmosphereClient {
      def receive: AtmoReceive = {

        case JsonMessage(json) =>
          logger.info("JSON="+json)
          broadcast(json) //Send to others
          send(json)      //Send back to sender

        case Connected =>
          logger.info("Player %s is connected" format uuid)
          broadcast(("Hello world!"), Everyone)

        case Disconnected(ClientDisconnected, _) =>
          logger.info("Player %s disconnected" format uuid)
          broadcast(("Goodbye"), Everyone)

        case Disconnected(ServerDisconnected, _) =>
          logger.info("Server kicked the client %s" format uuid)

        case _: TextMessage =>
          logger.info("Text message detected")
          send(("author" -> "system") ~ ("message" -> "Only JSON is allowed") ~ ("time" -> (new Date().getTime.toString)))
      }
    }
  }

  error {
    case e: Throwable => logger.error("ERROR "+e.toString)
  }

  //Simple map generation
  def generateMap() = {
    val map = Array.fill(10, 10)(scala.util.Random.nextInt(10))
  }

}
