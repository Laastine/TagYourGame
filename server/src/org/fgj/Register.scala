package org.fgj

/**
 * server
 * Created with IntelliJ IDEA.
 * User: laastine
 * Date: 24.1.2014
 */
case class Register(
  var username: String = "username",
  var password: String = "",
  val highScore: Integer = 0,
  val hippa: Boolean = false)
