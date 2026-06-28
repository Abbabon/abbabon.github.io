# frozen_string_literal: true

source "https://rubygems.org"

gemspec
#gem 'jemoji'

# These gems left Ruby's default set in 3.4+, but the pinned Jekyll 3.9.x still
# requires them. Add them only on Ruby 3.4+; on older Ruby they are still part
# of the standard library. GitHub Pages builds in its own environment and
# ignores these.
if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("3.4.0")
  gem "csv"
  gem "base64"
  gem "bigdecimal"
  gem "logger"
end