package controllers

import scala.concurrent._
import ExecutionContext.Implicits.global

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs._
import com.typesafe.config._

object Application extends Controller {
  private val config = ConfigFactory.load()
  private val zapi = config.getConfig("zapi").withFallback(config)
  private val schema = zapi.getString("schema")
  private val port = zapi.getInt("port")

  val zuoraApiBaseURL = s"""$schema://${zapi.getString("host")}${if (schema == "https" && port == 443) "" else ":" + port }/${zapi.getString("appcontext")}"""
  val apiAccessKeyId = zapi.getString("user")
  val apiSecretAccessKey = zapi.getString("password")

  def signature = Action.async {

    val result: Future[ws.Response] = {
      ws.WS.url(zuoraApiBaseURL + "/v1/hmac-signatures")
      .withHeaders(("apiAccessKeyId", apiAccessKeyId), ("apiSecretAccessKey", apiSecretAccessKey), ("Accept", "application/json"), ("Content-Type", "application/json"))
      .post(s"""
        {
          "uri": "$zuoraApiBaseURL/v1/payment-methods/credit-cards",
          "method": "POST",
          "accountKey": "A00000001"
        }
        """)
    }

    result map { resp =>
      Ok(resp.json.toString).as("application/json")
    }
  }

  def listCards = Action.async {
    val result: Future[ws.Response] = {
      val getCardsUrl = zuoraApiBaseURL + "/v1/payment-methods/credit-cards/accounts/A00000001"
      println(getCardsUrl)
      ws.WS.url(getCardsUrl)
      .withHeaders(("apiAccessKeyId", apiAccessKeyId), ("apiSecretAccessKey", apiSecretAccessKey), ("Accept", "application/json"), ("Content-Type", "application/json"))
      .get()
    }

    result map { resp =>
      println(resp.body)
      Ok(Json.stringify(resp.json)).as("application/json")
    }
  }

  def index = Action {
    Redirect("/index.html")
  }
}