name := """new-module2"""
organization := "com.certara"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.13.17"

libraryDependencies += guice

Compile / javacOptions ++= Seq("--release", "21")

libraryDependencies ++= Seq(
  "com.nimbusds" % "oauth2-oidc-sdk" % "11.10"
)